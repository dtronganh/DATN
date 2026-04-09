import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsInt()
  @Min(1)
  PORT: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  JWT_ACCESS_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  JWT_REFRESH_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  SQLITE_DB_PATH: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`❌ Environment validation error:\n${errors.toString()}`);
  }

  return validatedConfig;
}
