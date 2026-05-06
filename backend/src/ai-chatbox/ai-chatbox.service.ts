import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Product } from 'src/products/entities/product.entity';
import { AppConfigService } from 'src/config/config.service';
import { AdminDashboardService } from 'src/admin-dashboard/admin-dashboard.service';
import {
  AiChatboxAnswerResult,
  AiChatboxHistoryItemDto,
  AiChatboxInquiryDto,
  AiChatboxSuggestion,
} from './dto/ai-chatbox-inquiry.dto';
import {
  AdminStatsInquiryDto,
  AdminStatsInquiryResult,
} from './dto/admin-stats-inquiry.dto';

type LlmCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

const CHATBOX_MIN_SUGGESTIONS = 5;

@Injectable()
export class AiChatboxService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly appConfigService: AppConfigService,
    private readonly httpService: HttpService,
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  async handleConversation(
    payload: AiChatboxInquiryDto,
  ): Promise<AiChatboxAnswerResult> {
    const normalizedQuestion = payload.message.trim();
    const isCountIntent = this.detectProductCountIntent(normalizedQuestion);
    const isListAllIntent = this.detectListAllIntent(normalizedQuestion);
    const requiresProductLookup =
      this.detectShoppingIntent(normalizedQuestion) ||
      isCountIntent ||
      isListAllIntent;
    const availableOnly = this.detectAvailableStockIntent(normalizedQuestion);
    const locale = this.normalizeLocale(payload.locale);
    const history = this.sanitizeHistory(payload.history ?? []);

    const matchedProducts = requiresProductLookup
      ? await this.findMatchingProducts(normalizedQuestion, availableOnly)
      : [];

    if (isCountIntent || isListAllIntent) {
      const { productCount, totalStock } = await this.getMatchingProductStats(
        normalizedQuestion,
        availableOnly,
      );
      const suggestions = matchedProducts.map((product) => this.toSuggestion(product));

      return {
        answer: this.buildCountAnswer(
          locale,
          productCount,
          totalStock,
          availableOnly,
          suggestions,
          normalizedQuestion,
        ),
        suggestions,
      };
    }

    const answer = await this.generateAiAnswer(
      normalizedQuestion,
      matchedProducts,
      requiresProductLookup,
      history,
      locale,
    );

    return {
      answer,
      suggestions: requiresProductLookup
        ? matchedProducts.map((product) => this.toSuggestion(product))
        : [],
    };
  }

  async handleAdminStatsConversation(
    payload: AdminStatsInquiryDto,
  ): Promise<AdminStatsInquiryResult> {
    const question = String(payload.question ?? '').trim();
    const metric = payload.metric ?? 'users';
    const granularity = payload.granularity ?? 'week';
    const locale = this.normalizeLocale(payload.locale);

    const overview = await this.adminDashboardService.getOverview({
      metric,
      granularity,
    });

    const answer = this.adminDashboardService.buildRuleBasedInsight(
      question,
      overview,
      locale,
    );

    return {
      answer,
      generatedAt: overview.generatedAt,
    };
  }

  private normalizeLocale(locale?: string): 'vi' | 'en' {
    const normalized = (locale ?? '').trim().toLowerCase();
    if (!normalized) {
      return 'vi';
    }

    return normalized.startsWith('en') ? 'en' : 'vi';
  }

  private sanitizeHistory(
    history: AiChatboxHistoryItemDto[],
  ): AiChatboxHistoryItemDto[] {
    return history
      .filter(
        (item) =>
          item &&
          (item.role === 'user' || item.role === 'assistant') &&
          typeof item.content === 'string' &&
          item.content.trim().length > 0,
      )
      .map((item) => ({
        role: item.role,
        content: item.content.trim().slice(0, 500),
      }))
      .slice(-8);
  }

  private detectProductCountIntent(text: string): boolean {
    const normalized = text.toLowerCase();
    const intentKeywords = [
      'bao nhiêu',
      'bao nhieu',
      'bao nhiêu sản phẩm',
      'bao nhieu san pham',
      'tổng số',
      'tong so',
      'how many',
      'number of products',
      'count',
    ];

    return intentKeywords.some((keyword) => normalized.includes(keyword));
  }

  private buildCountAnswer(
    locale: string,
    count: number,
    totalStock: number,
    availableOnly: boolean,
    suggestions: AiChatboxSuggestion[],
    question: string,
  ): string {
    const queryLabel = this.buildQueryLabel(question, locale);
    const details = this.buildSuggestionSummary(suggestions, locale);

    if (locale === 'en') {
      if (count <= 0) {
        return availableOnly
          ? `No active in-stock products found for ${queryLabel}.`
          : `No active products found for ${queryLabel}.`;
      }

      const summary = availableOnly
        ? `I found ${count} active in-stock products for ${queryLabel} (total stock: ${totalStock}).`
        : `I found ${count} active products for ${queryLabel} (total quantity: ${totalStock}).`;

      return details.length > 0
        ? `${summary}\nTop ${details.length} suggestions:\n${details.join('\n')}`
        : summary;
    }

    if (count <= 0) {
      return availableOnly
        ? `Không tìm thấy sản phẩm active còn hàng cho ${queryLabel}.`
        : `Không tìm thấy sản phẩm active cho ${queryLabel}.`;
    }

    const summary = availableOnly
      ? `Mình tìm thấy ${count} sản phẩm active còn hàng cho ${queryLabel} (tổng tồn: ${totalStock}).`
      : `Mình tìm thấy ${count} sản phẩm active cho ${queryLabel} (tổng số lượng: ${totalStock}).`;

    return details.length > 0
      ? `${summary}\nTop ${details.length} gợi ý:\n${details.join('\n')}`
      : summary;
  }

  private buildQueryLabel(question: string, locale: string): string {
    const terms = this.extractDistinctTerms(question, 3);
    if (terms.length === 0) {
      return locale === 'en' ? 'your requested products' : 'nhóm sản phẩm bạn yêu cầu';
    }

    return terms.join(', ');
  }

  private buildSuggestionSummary(
    suggestions: AiChatboxSuggestion[],
    locale: string,
  ): string[] {
    return suggestions.slice(0, CHATBOX_MIN_SUGGESTIONS).map((item, index) => {
      const formattedPrice = new Intl.NumberFormat('vi-VN').format(item.price);

      if (locale === 'en') {
        return `${index + 1}. ${item.name} | price: ${formattedPrice} VND | stock: ${item.stock}`;
      }

      return `${index + 1}. ${item.name} | giá: ${formattedPrice} VNĐ | tồn: ${item.stock}`;
    });
  }

  private detectListAllIntent(text: string): boolean {
    const normalized = text.toLowerCase();
    const listKeywords = [
      'toàn bộ',
      'toan bo',
      'tất cả',
      'tat ca',
      'danh sách',
      'danh sach',
      'liệt kê',
      'liet ke',
      'all',
      'list',
    ];

    return listKeywords.some((keyword) => normalized.includes(keyword));
  }

  private detectShoppingIntent(text: string): boolean {
    const normalized = text.toLowerCase();
    const keywords = [
      'sản phẩm',
      'mua',
      'tìm',
      'gợi ý',
      'recommend',
      'suggest',
      'product',
      'shop',
      'find',
      'search',
      'price',
      'giá',
      'stock',
      'size',
      'model',
      'under',
      'above',
      'catalog',
      'danh mục',
    ];

    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return true;
    }

    return this.extractDistinctTerms(text).length > 0;
  }

  private detectAvailableStockIntent(text: string): boolean {
    const normalized = text.toLowerCase();
    const availableKeywords = [
      'có sẵn',
      'co san',
      'còn hàng',
      'con hang',
      'trong kho',
      'ở kho',
      'o kho',
      'stock',
      'available',
      'in stock',
    ];

    return availableKeywords.some((keyword) => normalized.includes(keyword));
  }

  private async findMatchingProducts(
    text: string,
    availableOnly = false,
  ): Promise<Product[]> {
    const primaryMatches = await this.buildProductMatchQuery(text, availableOnly)
      .orderBy('product.updatedAt', 'DESC')
      .addOrderBy('product.createdAt', 'DESC')
      .take(CHATBOX_MIN_SUGGESTIONS)
      .getMany();

    if (primaryMatches.length >= CHATBOX_MIN_SUGGESTIONS) {
      return primaryMatches;
    }

    const fallbackQuery = this.productRepository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL');

    if (availableOnly) {
      fallbackQuery.andWhere('product.stock > 0');
    }

    const existingIds = primaryMatches.map((product) => product.id);
    if (existingIds.length > 0) {
      fallbackQuery.andWhere('product.id NOT IN (:...existingIds)', { existingIds });
    }

    const fallbackProducts = await fallbackQuery
      .orderBy('product.updatedAt', 'DESC')
      .addOrderBy('product.createdAt', 'DESC')
      .take(CHATBOX_MIN_SUGGESTIONS - primaryMatches.length)
      .getMany();

    return [...primaryMatches, ...fallbackProducts];
  }

  private async countMatchingProducts(
    text: string,
    availableOnly = false,
  ): Promise<number> {
    return this.buildProductMatchQuery(text, availableOnly).getCount();
  }

  private async getMatchingProductStats(
    text: string,
    availableOnly = false,
  ): Promise<{ productCount: number; totalStock: number }> {
    const baseQuery = this.buildProductMatchQuery(text, availableOnly);
    const productCount = await baseQuery.getCount();

    const stockRaw = await this.buildProductMatchQuery(text, availableOnly)
      .select('COALESCE(SUM(product.stock), 0)', 'totalStock')
      .getRawOne<{ totalStock: string | number }>();

    const totalStock = Number(stockRaw?.totalStock ?? 0);

    return {
      productCount,
      totalStock: Number.isFinite(totalStock) ? totalStock : 0,
    };
  }

  private buildProductMatchQuery(text: string, availableOnly: boolean) {
    const { minPrice, maxPrice } = this.extractBudgetRange(text);
    const distinctTerms = this.extractDistinctTerms(text);

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .where('product.deletedAt IS NULL');

    if (availableOnly) {
      queryBuilder.andWhere('product.stock > 0');
    }

    if (distinctTerms.length > 0) {
      queryBuilder.andWhere(
        new Brackets((subQuery) => {
          distinctTerms.forEach((term, index) => {
            const key = `term${index}`;
            subQuery.andWhere(
              new Brackets((inner) => {
                inner
                  .where(`LOWER(product.name) LIKE :${key}`, {
                    [key]: `%${term}%`,
                  })
                  .orWhere(
                    `LOWER(COALESCE(product.description, '')) LIKE :${key}`,
                    {
                      [key]: `%${term}%`,
                    },
                  )
                  .orWhere(
                    `LOWER(COALESCE(category.name, '')) LIKE :${key}`,
                    {
                      [key]: `%${term}%`,
                    },
                  );
              }),
            );
          });
        }),
      );
    }

    if (minPrice !== null) {
      queryBuilder.andWhere('CAST(product.price AS REAL) >= :minPrice', {
        minPrice,
      });
    }

    if (maxPrice !== null) {
      queryBuilder.andWhere('CAST(product.price AS REAL) <= :maxPrice', {
        maxPrice,
      });
    }

    return queryBuilder;
  }

  private extractDistinctTerms(text: string, limit = 5): string[] {
    const stopWords = new Set([
      'hay',
      'hãy',
      'tong',
      'tổng',
      'so',
      'số',
      'bao',
      'nhieu',
      'nhiêu',
      'co',
      'có',
      'san',
      'sẵn',
      'o',
      'ở',
      'kho',
      'nay',
      'này',
      'tim',
      'tìm',
      'cho',
      'toi',
      'tôi',
      'san',
      'sản',
      'pham',
      'phẩm',
      'gia',
      'giá',
      'duoi',
      'dưới',
      'tren',
      'trên',
      'tu',
      'từ',
      'den',
      'đến',
      'va',
      'và',
      'hoac',
      'hoặc',
      'muon',
      'muốn',
      'can',
      'cần',
      'goi',
      'gợi',
      'y',
      'ý',
      'tu',
      'tư',
      'van',
      'vấn',
      'minh',
      'mình',
      'giup',
      'giúp',
      'xem',
      'hoi',
      'hỏi',
      'nhung',
      'những',
      'cai',
      'cái',
      'loai',
      'loại',
      'search',
      'find',
      'recommend',
      'suggest',
      'product',
      'products',
      'shop',
      'store',
      'the',
      'thể',
      'nao',
      'nào',
      'khong',
      'không',
      'trieu',
      'triệu',
      'nghin',
      'nghìn',
      'ngan',
      'ngàn',
      'k',
      'vnd',
      'dong',
      'đồng',
      'under',
      'above',
      'between',
      'from',
      'to',
      'available',
      'stock',
      'count',
      'how',
      'many',
      'number',
      'all',
      'list',
      'catalog',
    ]);

    return Array.from(
      new Set(
        text
          .toLowerCase()
          .split(/\s+/)
          .map((token) => token.replace(/[^\p{L}\p{N}]/gu, ''))
          .filter((token) => token.length >= 2 && !stopWords.has(token)),
      ),
    ).slice(0, limit);
  }

  private extractBudgetRange(text: string): {
    minPrice: number | null;
    maxPrice: number | null;
  } {
    const normalized = text.toLowerCase();
    const numericMatches = Array.from(
      normalized.matchAll(
        /(\d[\d.,]*)\s*(triệu|trieu|tr|m|nghìn|nghin|ngan|ngàn|k|vnd|đ|dong|đồng)?/g,
      ),
    )
      .map((match) => ({
        value: this.parseCurrencyValue(match[1], (match[2] ?? '').trim()),
        position: match.index ?? 0,
      }))
      .filter(
        (entry): entry is { value: number; position: number } =>
          entry.value !== null,
      );

    const values = numericMatches.map((entry) => entry.value);
    if (!values.length) {
      return { minPrice: null, maxPrice: null };
    }

    if (
      normalized.includes('dưới') ||
      normalized.includes('duoi') ||
      normalized.includes('<=') ||
      normalized.includes('under') ||
      normalized.includes('max')
    ) {
      return {
        minPrice: null,
        maxPrice:
          this.pickBoundaryValue(normalized, numericMatches, [
            'dưới',
            'duoi',
            '<=',
            'under',
            'max',
          ]) ?? values[0],
      };
    }

    if (
      normalized.includes('trên') ||
      normalized.includes('tren') ||
      normalized.includes('>=') ||
      normalized.includes('above') ||
      normalized.includes('min')
    ) {
      return {
        minPrice:
          this.pickBoundaryValue(normalized, numericMatches, [
            'trên',
            'tren',
            '>=',
            'above',
            'min',
          ]) ?? values[0],
        maxPrice: null,
      };
    }

    const hasRangePhrase =
      (normalized.includes('từ') || normalized.includes('tu') || normalized.includes('from')) &&
      (normalized.includes('đến') || normalized.includes('den') || normalized.includes('to'));

    if (hasRangePhrase && values.length >= 2) {
      return {
        minPrice: Math.min(values[0], values[1]),
        maxPrice: Math.max(values[0], values[1]),
      };
    }

    return { minPrice: null, maxPrice: null };
  }

  private parseCurrencyValue(rawNumber: string, unit: string): number | null {
    let normalized = rawNumber.replace(/,/g, '.');
    const dotCount = (normalized.match(/\./g) || []).length;
    
    if (dotCount > 1) {
      normalized = normalized.replace(/\./g, '');
    } else if (dotCount === 1) {
      const parts = normalized.split('.');
      if (parts[1].length === 3) {
        normalized = normalized.replace('.', '');
      }
    }

    const parsed = Number(normalized);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    const normalizedUnit = unit.toLowerCase();
    if (['triệu', 'trieu', 'tr', 'm'].includes(normalizedUnit)) {
      return parsed * 1_000_000;
    }

    if (['nghìn', 'nghin', 'ngan', 'ngàn', 'k'].includes(normalizedUnit)) {
      return parsed * 1_000;
    }

    return parsed;
  }

  private pickBoundaryValue(
    text: string,
    entries: Array<{ value: number; position: number }>,
    operators: string[],
  ): number | null {
    const indexes = operators
      .map((operator) => text.indexOf(operator))
      .filter((index) => index >= 0);

    if (!indexes.length) {
      return entries[0]?.value ?? null;
    }

    const anchor = Math.min(...indexes);
    const candidate = entries
      .filter((entry) => entry.position >= anchor)
      .sort((a, b) => a.position - b.position)[0];

    return candidate?.value ?? entries[0]?.value ?? null;
  }

  private async generateAiAnswer(
    userMessage: string,
    products: Product[],
    includeCatalogContext: boolean,
    history: AiChatboxHistoryItemDto[],
    locale: string,
  ): Promise<string> {
    const localeInstruction =
      locale === 'en'
        ? 'Always respond in English with concise and practical shopping guidance.'
        : 'Luôn trả lời bằng tiếng Việt, ngắn gọn và tập trung vào tư vấn mua sắm thực tế.';
    const fallbackNoAnswer =
      locale === 'en'
        ? 'Sorry, I do not have a suitable answer right now.'
        : 'Xin lỗi, mình chưa có câu trả lời phù hợp lúc này.';
    const fallbackBusy =
      locale === 'en'
        ? 'Sorry, the AI assistant is currently busy. Please try again later.'
        : 'Xin lỗi, hiện tại trợ lý AI đang bận. Vui lòng thử lại sau.';

    const catalogContext = includeCatalogContext
      ? products.length > 0
        ? products
            .map(
              (product) =>
                `- ${product.name} | price: ${Number(product.price)} | stock: ${product.stock} | slug: ${product.slug ?? ''}`,
            )
            .join('\n')
        : '- No matching products found.'
      : '- Product lookup not requested.';

    try {
      const endpoint = `${this.appConfigService.aiBaseUrl.replace(/\/$/, '')}/chat/completions`;

      const response = await this.httpService.axiosRef.post<LlmCompletionResponse>(
        endpoint,
        {
          model: this.appConfigService.aiModel,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: `Bạn là AI Sales Assistant cho website bán máy tính, laptop, PC gaming, workstation và linh kiện công nghệ.

## Vai trò
Bạn là chuyên gia tư vấn công nghệ với kinh nghiệm 10+ năm trong lĩnh vực:
- Laptop văn phòng, gaming, đồ họa
- PC gaming, PC workstation, PC văn phòng
- Linh kiện máy tính: CPU, GPU, Mainboard, RAM, SSD, HDD, PSU, Case, Tản nhiệt, Màn hình, Bàn phím, Chuột, Tai nghe...

Nhiệm vụ của bạn:
1. Tư vấn sản phẩm phù hợp nhu cầu khách hàng
2. So sánh sản phẩm rõ ràng, dễ hiểu
3. Giải thích thông số kỹ thuật đơn giản
4. Đề xuất cấu hình tối ưu theo ngân sách
5. Upsell hợp lý nhưng không gây khó chịu

## Cách tư vấn
Luôn hỏi khách 4 thông tin trước khi tư vấn nếu chưa rõ:
- Ngân sách bao nhiêu?
- Dùng để làm gì? (học tập, văn phòng, gaming, edit video, lập trình, AI...)
- Có ưu tiên thương hiệu nào không?
- Cần laptop hay PC?

Sau đó phân tích: Hiệu năng, Độ bền, Khả năng nâng cấp, Nhiệt độ / độ ổn định, Giá / hiệu năng.

## Kiến thức chuyên môn
Bạn hiểu rõ:
CPU: Intel Core i3/i5/i7/i9, AMD Ryzen 3/5/7/9
GPU: NVIDIA RTX series, AMD Radeon series
Storage: SATA SSD, NVMe SSD, HDD
RAM: DDR4, DDR5
Mainboard: Chipset Intel và AMD, Socket compatibility
PSU: Công suất phù hợp từng cấu hình, Chuẩn 80 Plus

## Quy tắc trả lời
1. Trả lời ngắn gọn, đúng trọng tâm. Không thêm đoạn ghi chú hoặc cảnh báo kiểu "Lưu ý/Note".
2. Nếu khách không rành công nghệ, giải thích đơn giản.
3. Không dùng quá nhiều thuật ngữ kỹ thuật nếu không cần.
4. Nếu sản phẩm không phù hợp nhu cầu, nói rõ lý do.
5. Nếu thiếu thông tin, luôn hỏi lại trước khi tư vấn.
6. KHÔNG BỊA THÔNG SỐ SẢN PHẨM. Chỉ dùng dữ liệu có trong database được cung cấp.
7. Nếu hết hàng, đề xuất sản phẩm tương đương.

## Format trả lời
Luôn trả theo format (nếu có đề xuất sản phẩm):

[Đánh giá nhu cầu]
...

[Đề xuất]
1. Tên sản phẩm
- Ưu điểm:
- Nhược điểm:
- Phù hợp với:

[Kết luận]
...

## Xử lý tình huống
Nếu khách hỏi "Máy này chơi game AAA được không?" -> Phân tích FPS ước tính ở setting phổ biến.
Nếu khách hỏi "Máy này có đáng mua không?" -> Phân tích giá/hiệu năng, độ bền, khả năng nâng cấp.
Nếu khách hỏi "So sánh 2 sản phẩm" -> So sánh theo bảng: CPU | GPU | RAM | SSD | Màn hình | Nhiệt độ | Pin | Giá
Nếu khách chốt mua -> Hướng dẫn thanh toán, bảo hành, vận chuyển.

${localeInstruction}`,
            },
            ...history.map((item) => ({ role: item.role, content: item.content })),
            {
              role: 'user',
              content: `Khách: ${userMessage}\n\nDữ liệu kho:\n${catalogContext}`,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.appConfigService.aiApiKey}`,
          },
          timeout: 30_000,
        },
      );

      const aiText = response.data?.choices?.[0]?.message?.content?.trim();
      if (!aiText) {
        return fallbackNoAnswer;
      }

      return this.sanitizeAiAnswer(aiText);
    } catch {
      return fallbackBusy;
    }
  }

  private sanitizeAiAnswer(text: string): string {
    const lines = text
      .split('\n')
      .map((line) => line.trimEnd())
      .filter((line) => {
        const normalized = line
          .toLowerCase()
          .replace(/[*_`]/g, '')
          .trim();

        if (!normalized) {
          return true;
        }

        const blockedPrefixes = [
          'lưu ý:',
          'luu y:',
          'note:',
          'ghi chú:',
          'ghi chu:',
        ];

        return !blockedPrefixes.some((prefix) => normalized.startsWith(prefix));
      });

    const sanitized = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    return sanitized || text;
  }

  private toSuggestion(product: Product): AiChatboxSuggestion {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug ?? `${product.id}`,
      price: Number(product.price ?? 0),
      stock: Number(product.stock ?? 0),
      thumbnail: product.thumbnail ?? null,
    };
  }
}
