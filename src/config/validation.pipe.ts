import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class CustomValidationPipe implements PipeTransform {

  /**
   * PipeTransform<T, R> 是每个管道必须要实现的泛型接口。
   * 泛型 T 表明输入的 value 的类型，R 表明 transfrom() 方法的返回类型
   * @param value 
   * @param metadata 
   * @returns 
   */
  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = value;
    if (error) {
        throw new BadRequestException('Validation failed');
    }
    return value;
  }
}
