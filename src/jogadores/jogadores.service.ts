import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';

@Injectable()
export class JogadoresService {
  private jogadores: Jogador[] = [];

  //uso do construtor para injetar o Model Jogador
  constructor(
    @InjectModel('Jogador') private readonly jogadorModule: Model<Jogador>,
  ) {}

  private readonly logger = new Logger(JogadoresService.name);

  async criarAtualizarJogador(criarJogadorDto: CriarJogadorDto): Promise<void> {
    const { email } = criarJogadorDto;

    // const jogadorEncontrado = this.jogadores.find(
    //   (jogador) => jogador.email === email,
    // );

    const jogadorEncontrado = await this.jogadorModule
      .findOne({ email })
      .exec();

    if (jogadorEncontrado) {
      this.atualizar(criarJogadorDto);
    } else {
      this.criar(criarJogadorDto);
    }
  }

  async consultarTodosJogadores(): Promise<Jogador[]> {
    // return await this.jogadores;
    return await this.jogadorModule.find().exec();
  }

  async consultarJogadoresPeloEmail(email: string): Promise<Jogador> {
    const jogadorEncontrado = await this.jogadorModule
      .findOne({ email })
      .exec();

    if (!jogadorEncontrado) {
      throw new NotFoundException(
        `Jogador com email: ${email} não encontrado.`,
      );
    }

    return jogadorEncontrado;
  }

  async deletarJogador(email: string): Promise<any> {
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

    return await this.jogadorModule.remove({ email }).exec();
  }

  private async criar(criarJogadorDto: CriarJogadorDto): Promise<Jogador> {
    const jogadorCriado = new this.jogadorModule(criarJogadorDto);
    return await jogadorCriado.save();

    // const { nome, email, telefoneCelular } = criarJogadorDto;
    // const jogador: Jogador = {
    //   _id: uuidv4(),
    //   nome,
    //   telefoneCelular,
    //   email,
    //   ranking: `A`,
    //   posicaoRanking: 1,
    //   urlFotoJogador: `https://images.unsplash.com/photo-1626811680190-30f57534a4b0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2002&q=80`,
    // };

    // this.logger.log(`criarJogadorDto: ${JSON.stringify(jogador)}`);
    // this.jogadores.push(jogador);
  }

  private async atualizar(criarJogadorDto: CriarJogadorDto): Promise<Jogador> {
    return await this.jogadorModule
      .findOneAndUpdate(
        //campo de pesquisa:
        { email: criarJogadorDto.email },
        //parâmetro de configuração
        { $set: criarJogadorDto },
      )
      .exec();

    // const { nome } = criarJogadorDto;
    // jogadorEncontrado.nome = nome;
  }
}
