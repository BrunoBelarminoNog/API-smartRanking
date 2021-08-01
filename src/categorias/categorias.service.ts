import { JogadoresService } from './../jogadores/jogadores.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AtualizarCategoriaDto } from './dtos/atualizar-categoria.dto';
import { CriarCategoriaDto } from './dtos/criar-categoria.dto';
import { Categoria } from './interfaces/categoria.interface';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectModel('Categoria') private readonly categoriaModel: Model<Categoria>,
    private readonly jogadoresService: JogadoresService,
  ) {}

  async criarCategoria(
    criarCategoriaDto: CriarCategoriaDto,
  ): Promise<Categoria> {
    const { categoria } = criarCategoriaDto;

    const categoriaEncontrada = await this.categoriaModel
      .findOne({ categoria })
      .exec();

    if (categoriaEncontrada) {
      throw new BadRequestException(
        `Categoria ${categoriaEncontrada} já cadastrada`,
      );
    }

    const categoriaCriada = new this.categoriaModel(criarCategoriaDto);

    return await categoriaCriada.save();
  }

  async consultarTodasCategorias(): Promise<Categoria[]> {
    //.populate() insere os dados do jogador no array, guiando-se pela referencia descrita no schema de categoria
    return await this.categoriaModel.find().populate('jogadores').exec();
  }

  async consultarCategoriaPeloId(categoria: string): Promise<Categoria> {
    const categoriaEncontrada = await this.categoriaModel
      .findOne({ categoria })
      .populate('jogadores')
      .exec();

    if (!categoriaEncontrada) {
      throw new NotFoundException(`Categoria ${categoria} não encontrada`);
    }

    return categoriaEncontrada;
  }

  async atualizarCategoria(
    categoria: string,
    atualizarCategoriaDto: AtualizarCategoriaDto,
  ): Promise<void> {
    const categoriaEncontrada = await this.categoriaModel
      .findOne({ categoria })
      .exec();

    if (!categoriaEncontrada) {
      throw new NotFoundException(`Categoria ${categoria} não encontrada`);
    }

    await this.categoriaModel
      .findOneAndUpdate({ categoria }, { $set: atualizarCategoriaDto })
      .exec();
  }

  async atribuirCategoriaJogador(params: string[]): Promise<void> {
    const categoria = params['categoria'];
    const idJogador = params['idJogador'];

    const categoriaEncontrada = await this.categoriaModel
      .findOne({ categoria })
      .exec();

    const jogadorCadastradoNaCategoria = await this.categoriaModel
      .find({ categoria })
      .where('jogadores')
      .in(idJogador)
      .exec();

    //VALIDAÇÕES

    //consultar se idJogador é de um jogador válido, se não é lançada uma excessão direto do contexto do jogadoresService
    await this.jogadoresService.consultarJogadoresPeloId(idJogador);

    if (!categoriaEncontrada) {
      throw new BadRequestException(`Categoria ${categoria} não cadastrada`);
    }

    if (jogadorCadastradoNaCategoria.length > 0) {
      throw new BadRequestException(
        `Jogador '${idJogador}' já cadastrado na categoria '${categoria}'`,
      );
    }

    categoriaEncontrada.jogadores.push(idJogador);

    await this.categoriaModel
      .findOneAndUpdate({ categoria }, { $set: categoriaEncontrada })
      .exec();
  }
}
