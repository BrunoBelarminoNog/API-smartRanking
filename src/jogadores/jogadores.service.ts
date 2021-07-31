import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AtualizarJogadorDto } from './dtos/atualizar-jogador.dto';
// import { v4 as uuidv4 } from 'uuid';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';

@Injectable()
export class JogadoresService {
  //uso do construtor para injetar o Model Jogador
  constructor(
    @InjectModel('Jogador') private readonly jogadorModule: Model<Jogador>,
  ) {}

  private readonly logger = new Logger(JogadoresService.name);

  async criarJogador(criarJogadorDto: CriarJogadorDto): Promise<Jogador> {
    const { email } = criarJogadorDto;

    // const jogadorEncontrado = this.jogadores.find(
    //   (jogador) => jogador.email === email,
    // );

    const jogadorEncontrado = await this.jogadorModule
      .findOne({ email })
      .exec();

    if (jogadorEncontrado) {
      throw new BadRequestException(
        `Jogador com o email: ${email} já cadastrado.`,
      );
    }

    const jogadorCriado = new this.jogadorModule(criarJogadorDto);
    return await jogadorCriado.save();
  }

  async atualizarJogador(
    _id: string,
    atualizarJogadorDto: AtualizarJogadorDto,
  ): Promise<void> {
    const jogadorEncontrado = await this.jogadorModule.findOne({ _id }).exec();

    if (!jogadorEncontrado) {
      throw new NotFoundException(`Jogador com o id ${_id} não encontrado`);
    }

    await this.jogadorModule
      .findOneAndUpdate(
        //campo de pesquisa:
        { _id },
        //parâmetro de configuração
        { $set: atualizarJogadorDto },
      )
      .exec();
  }

  async consultarTodosJogadores(): Promise<Jogador[]> {
    return await this.jogadorModule.find().exec();
  }

  async consultarJogadoresPeloId(_id: string): Promise<Jogador> {
    const jogadorEncontrado = await this.jogadorModule.findOne({ _id }).exec();

    if (!jogadorEncontrado) {
      throw new NotFoundException(`Jogador com id: ${_id} não encontrado.`);
    }

    return jogadorEncontrado;
  }

  async deletarJogador(_id: string): Promise<any> {
    const jogadorEncontrado = await this.jogadorModule.findOne({ _id }).exec();

    if (!jogadorEncontrado) {
      throw new NotFoundException(`Jogador com id: ${_id} não encontrado.`);
    }

    return await this.jogadorModule.deleteOne({ _id }).exec();
  }

  // const jogadorEncontrado = this.jogadores.find(
  //   (jogador) => jogador.email === email,
  // );

  // if (!jogadorEncontrado) {
  //   throw new NotFoundException(
  //     `Jogador com email: ${email} não encontrado.`,
  //   );
  // }

  // this.jogadores = this.jogadores.filter(
  //   (jogador) => jogador.email !== jogadorEncontrado.email,
  // );
}
