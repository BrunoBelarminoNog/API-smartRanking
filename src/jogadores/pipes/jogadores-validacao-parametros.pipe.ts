import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

export class JogadoresValidacaoParametrosPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // console.log(`value: ${value}, metadata: ${metadata.data}`);

    if (!value) {
      throw new BadRequestException(
        `O valor do parâmetro ${metadata.data} deve ser preenchido`,
      );
    }

    return value;
  }
}
