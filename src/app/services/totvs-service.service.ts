import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Subscription, map, of, take, tap } from 'rxjs';
import { Observable } from 'rxjs';

import { PoHttpRequestInterceptorService, PoTableColumn, PoTableDetail } from '@po-ui/ng-components';
import { Usuario } from '../interfaces/usuario';
import { Monitor } from '../interfaces/monitor';
import { Reparo } from '../interfaces/reparo';
import { environment } from '../environments/environment';

//--- Header somente para DEV
const headersTotvs = new HttpHeaders(environment.totvs_header);

@Injectable({
  providedIn: 'root',
})
export class TotvsService {
  //Signals
  usuarioSelecionado: WritableSignal<Usuario> = signal({
    codUsuario: '',
    codEstabelecimento: '',
    nrProcesso: '',
  });

  _url      = environment.totvs_url
  _urlGeral = environment.totvs_url_geral

  //_url41 = environment.totvs41_url;
  
  constructor(private http: HttpClient) {}

  //--- Variavel
  private emissorEvento$ = new Subject<any>();

  //--- Emissor
  public EmitirParametros(valor: any) {
    this.emissorEvento$.next(valor);
  }

  //--- Observador
  public LerParametros() {
    return this.emissorEvento$.asObservable();
  }

  //------------ Coluna Grid Detalhe
  obterColunasTotal(): Array<PoTableColumn> { //colunasDetalhe
    return [
      { property: 'codEmitente',   label: 'codEmitente',   visible: false },
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'tpPed',         label: 'TP' },
      { property: 'nrPedcli',      label: 'Pedido Cli' },
      { property: 'nomeAbrev',     label: 'Nome Abrev' },
      { property: 'nrPedido',      label: 'Pedido',        visible: false },
      { property: 'codTransp',     label: 'codTransporte', visible: false },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'indPrioridade', label: 'Pri.' },
      { property: 'qtdItens',      label: 'Qtd.Itens',     visible: true, width: '100px' },
      { property: 'vlItens',       label: 'Vl.Itens',      visible: true, type: 'currency', format: 'BRL' },
      
    ]

  }

  obterColunasSelecao(): Array<PoTableColumn> {
    return [
      { property: 'codEmitente',   label: 'codEmitente', visible: false },
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'nrPedido',      label: "Pedido",      visible: false},
      { property: 'nrPedcli',      label: 'Pedido Cli' },
      { property: 'nomeAbrev',     label: 'Nome Abrev' },
      { property: 'cddEmbarqRes',  label: 'Resumo'},
      { property: 'cddEmbarq',     label: 'Embarque',      visible: false},
      { property: 'nrResumo',      label: 'Resumo',        visible: false},
      { property: 'codTransp',     label: 'codTransporte', visible: false },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'tpPed',         label: 'TP' },
      { property: 'indPrioridade', label: 'Prioridade' },
      { property: 'qtdItens',      label: 'Qtd.Itens', visible: true  },
      { property: 'vlItens',       label: 'Vl.Itens',  visible: true, type: 'currency', format: 'BRL' },
    ]

  }

  obterColunasSelecaoItens(): Array<PoTableColumn> {
    return [
      { property: 'nrPedido',      label: "Pedido",    visible: true},
      { property: 'itCodigo',      label: 'Item' },
      { property: 'qtdItens',      label: 'Qtd.Itens', visible: true  },
      { property: 'codDepos',      label: 'Depósito' },
      { property: 'vlItens',       label: 'Vl.Itens',  visible: true, type: 'currency', format: 'BRL' },
    ]

  }

  obterColunasConsolida(): Array<PoTableColumn> {
    return [
      { property: 'codEstabel',    label: 'Estab.',   visible: true, width: '120px'},
      { property: 'nrConsolidacao',label: 'Nr.Cons.', visible: true, width: '140px', type: 'number'},
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'userAlt',       label: 'Usuário' }, 
      { property: 'lConsolidado',  label: 'Consolidado' },
    ]

  }

  obterColunasConsolidaItems(): Array<PoTableColumn> {
    return [
      { property: 'nrConsolidacao',label: 'Nr.Cons.', visible: true, width: '140px', type: 'number'},
      { property: 'cddEmbarqRes',  label: 'Embarque/Res'},
      { property: 'cddEmbarq',     label: 'Embarque', visible: false},
      { property: 'nrResumo',      label: 'Resumo',   visible: false},
      { property: 'nrPedido',      label: 'Pedido' },
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'userAlt',       label: 'Usuário' },
      { property: 'lConsolidado',  label: 'Consolidado' },
    ]

  }

  obterColunasFaturado(): Array<PoTableColumn> {
    return [
      { property: 'codEstabel',    label: 'Estab.',   visible: false, width: '120px'},
      { property: 'nrConsolidacao',label: 'Nr.Cons.', visible: true,  width: '140px', type: 'number'},
      { property: 'dtEmisNota',    label: 'Data'},
      { property: 'cSerie',        label: 'Serie' },
      { property: 'nrNotaFis',     label: 'Nota Fiscal' },      
      { property: 'cddEmbarqRes',  label: 'Embarque/Res'},
      { property: 'cddEmbarq',     label: 'Embarque', visible: false},
      { property: 'nrResumo',      label: 'Resumo',   visible: false},
      { property: 'descEmitente',  label: 'Emitente' },
      { property: 'nomTransp',     label: 'Transporte', },
      { property: 'lFaturado',     label: 'Faturado' },
    ]

  }

  //---Faturar Embarque
  public FaturarEmbarque(params?: any){
    return this.http.post(`${this._url}/FaturarEmbarque`, params, {headers:headersTotvs}).pipe(take(1))  
  }
  //---Calculo de Fretes  
  public ObterCalculoFrete(params?: any){
    return this.http.post(`${this._url}/ObterCalculoFrete`, params, {headers:headersTotvs}).pipe(take(1))
  }

  //--- Consolidar
  public ObterConsolidar(params?: any){
    return this.http.post(`${this._url}/ObterConsolidar`, params, {headers:headersTotvs}).pipe(take(1))
  }

  //--- Eliminar Pedido da Consolidação por id
  public EliminarPorId(params?: any) {
    return this.http.post(`${this._url}/EliminarPorId`, params, { headers: headersTotvs }).pipe(take(1));
  }

  //--- Atualizar Envio para Histórico
  public onAttEnvHist(params?: any){
    return this.http.get(`${this._urlGeral}/onAttEnvHist`, {params:params, headers:headersTotvs}).pipe(take(1));
  }
  
  //--- Obter parametros de Cadastro
  public ObterCadastro(params?: any){
    return this.http.get(`${this._urlGeral}/ObterCadastro`, {params:params, headers:headersTotvs}).pipe(take(1));
  }

  //--- COMBOBOX TECNICOS
  //Retorno transformado no formato {label: xxx, value: yyyy}
  public ObterEmitentesDoEstabelecimento(id: string) {
    return this.http.get<any>(`${this._url}/ObterTecEstab?codEstabel=${id}`, {headers: headersTotvs,}).pipe(
        map((item) => {
          return item.items.map((item: any) => {
            return {
              label: item.codTec + ' ' + item.nomeAbrev,
              value: item.codTec,
            };
          });
        }),
        take(1)
      );
  }

  //--- COMBOBOX ESTABELECIMENTOS
  //Retorno transformado no formato {label: xxx, value: yyyy}
  public ObterEstabelecimentos(params?: any) {
    return this.http.get<any>(`${this._url}/ObterEstab`, { params: params, headers: headersTotvs })
      .pipe(
        map((item) => {
          return item.items.map((item: any) => {
            return {
              label: item.codEstab + ' ' + item.nome,
              value: item.codEstab,
              codFilial: item.codFilial,
            };
          });
        }),
        take(1)
      );
  }

  //--- COMBOBOX TRANSPORTES
  //Retorno transformado no formato {label: xxx, value: yyyy}
  public ObterTransportadoras() {
    return this.http.get<any>(`${this._url}/ObterTransp`, { headers: headersTotvs }).pipe(map((item) => {
      return item.items.map((item: any) => {
        return {
          label: item.codTransp + ' ' + item.nomeAbrev,
          value: item.codTransp,
        };
      });
    }),
      ///tap(data => {console.log("Data Transformada pelo Map =>", data)}),
      take(1)
    );
  }

  //--- Obter a lista totais de Pedidos do Estabelecimento
  public ObterTotais(params?: any) {
    return this.http.get(`${this._url}/ObterTotais?codEstabel=${params}`, { headers: headersTotvs, }).pipe(take(1));
  }

  //--- Programas DDK
  public AbrirProgramaTotvs(params?: any) {
    return this.http.get('/totvs-menu/rest/exec', { params, headers: headersTotvs }).pipe(take(1));
  }

};
