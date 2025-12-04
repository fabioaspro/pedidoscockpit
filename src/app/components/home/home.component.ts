import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, inject, signal } from '@angular/core';
import { PoMenuItem, PoModalAction, PoModalComponent, PoPageAction, PoRadioGroupOption, PoStepperComponent, PoTableAction, PoTableColumn, PoTableComponent, PoNotificationService, PoDialogService, PoNotification, PoButtonComponent, PoLoadingModule, PoStepperModule, PoWidgetModule, PoDividerModule, PoFieldModule, PoIconModule, PoTableModule, PoButtonModule, PoTooltipModule, PoRadioGroupModule, PoModalModule, PoModule, PoAccordionModule, PoTableLiterals, PoStepComponent, PoContainerModule, PoComboOption, PoPageModule } from '@po-ui/ng-components';
import { TotvsService } from '../../services/totvs-service.service'
import { catchError, delay, elementAt, finalize, first, forkJoin, interval, of, Subscription } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExcelService } from '../../services/excel-service.service';
import { Usuario } from '../../interfaces/usuario';
import { TotvsService46 } from '../../services/totvs-service-46.service';
import { NgClass, NgIf, CurrencyPipe, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BtnDownloadComponent } from '../btn-download/btn-download.component';
import { RpwComponent } from '../rpw/rpw.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    PoLoadingModule,
    PoStepperModule,
    NgIf,
    PoWidgetModule,
    PoDividerModule,
    PoFieldModule,
    CurrencyPipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PoIconModule,
    PoTableModule,
    PoButtonModule,
    PoTooltipModule,
    PoRadioGroupModule,
    PoModalModule,
    PoAccordionModule,
    PoContainerModule,
    PoPageModule,
    BtnDownloadComponent,
    RpwComponent
]
})
export class HomeComponent {

  //--- Modal de Peso
  selectedItem: any = {}

  //--- Loadings
  loadTela:  boolean = false
  loadExcel: boolean = false
  labelLoadTela:    string = ''
  loadTecnico:      string = ''
  loadTransp:       string = ''
  loadPrioridade:   string = ''
  loadConsolidacao: string = ''
  loadFaturados:    string = ''

  //--- Controle de Steps
  StepAtual:        any
  alturaStepper:    number = window.innerHeight - 168
  alturaStepperSel: number = window.innerHeight - 128

  //--- Aba Dashboard
  labelContadores:  string[] = ['0', '0', '0', '0', '0', '0', '0', '0']
  totSelecionado:   string[] = ['0', '0', '0', '0', '0']
  ultatt:           string = ''
  
  //--- Aba Seleção
  emitenteSelecionado:       string = ''
  transportadoraSelecionado: string = ''
  prioridadeSelecionado:     string = ''

  //--- Controle dos Grids  
  alturaGrid:             number = window.innerHeight - 255
  alturaGridSelecionados: number = window.innerHeight - 10
  alturaGridConsolidados: number = window.innerHeight - 100
  alturaGridFaturados:    number = window.innerHeight - 100

  //--- Lista dos Grids
  listaEstabelecimentos!:       any[]
  listaTecnicos!:               any[]
  listaTransp!:                 any[]
  listaTranspFiltrada!:         PoComboOption[] 
  listaSelecao:                 any[] = []
  listaSelecaoFiltrada:         any[] = []
  listaSelecionados:            any[] = []
  listaSelecionadosItens:       any[] = []
  listaSelecionadosItensFiltro: any[] = []
  listaSelecionadosItensPeso:   any[] = []
  listaConsolidacao!:           any[]
  listaConsolida:               any[] = []
  listaConsolidaFiltro:         any[] = []
  listaConsolidaItens:          any[] = []
  listaConsolidaItensFiltro:    any[] = []
  listaFaturamento!:            any[]
  listaFaturados:               any[] = []
  listaFaturadosFiltro:         any[] = []
  listaExecutandoFiltro:        any[] = []
  listaFaturadosItens:          any[] = []
  listaFaturadosItensFiltro:    any[] = []
  selectedRows:                 any[] = []

  //--- Colunas dos Grids
  colunasSelecao:         Array<PoTableColumn> = []
  colunasSelecaoItens:    Array<PoTableColumn> = []
  colunasSelecaoItensPeso:Array<PoTableColumn> = []
  colunasConsolida:       Array<PoTableColumn> = []
  colunasConsolidaExec:   Array<PoTableColumn> = []
  colunasConsolidaFat:    Array<PoTableColumn> = []
  colunasConsolidaItens:  Array<PoTableColumn> = []
  colunasFaturados:       Array<PoTableColumn> = []

  //--- Controle de Modal
  lHideSearch: boolean = false

  //--- Controle do acompanhamento RPW
  numPedExec         = signal(0)
  labelTimer         : string='Aguarde a liberação do arquivo...'
  labelTimerDetail   : string=''
  labelPedExec       : string=''
  telaTimerFoiFechada: boolean=false
  sub!               : Subscription

  //--- Informacoes Dialog Grids (Resumo)
  colunasDetalhe: Array<PoTableColumn> = []
  tituloDetalhe!: string
  itemsDetalhe! : any[]
  itemsTotal!   : any[]
  
  //--- Variaveis e Combobox
  codEstabelecimento:          string = ''
  codTecnico:                  string = ''
  codTransp:                   string = ''
  nrConsolidacao:              string = ''
  indPrioridade:               string = ''
  indConsolidacao:             string = ''
  indFaturados:                string = ''
  placeHolderEstabelecimento!: string
  serieSaida:                  any    = '999'
  codTranspnf:                 string = ''
  paramsEstab:                 any    = []
  valConsolidado:              string = ''
  dthrAlt:                     Date   = new Date()
  currentStep                  = '' // etapa atual
  previousStep                 = ''

  //--- Modal Resumo
  consolidacao:       any
  pageActions:        Array<any> = []
  listaErros!:        any[]
  colunasErro!:       PoTableColumn[]
  alturaGridLog:      number=window.innerHeight - 555
  cMensagemErroRPW    = ''

  //--- Referencias
  @ViewChild('detailsModalTot',  { static: true }) detailsModalTot:  PoModalComponent | undefined
  @ViewChild('detailsModalPend', { static: true }) detailsModalPend: PoModalComponent | undefined
  @ViewChild('detailsModalCon',  { static: true }) detailsModalCon:  PoModalComponent | undefined
  @ViewChild('ChamaFaturar',     { static: true }) ChamaFaturar:     PoModalComponent | undefined
  @ViewChild('ChamaPesoItem',    { static: true }) ChamaPesoItem:    PoModalComponent | undefined
  @ViewChild('alteraPeso',       { static: true }) alteraPeso:       PoModalComponent | undefined
  @ViewChild('Resumo',           { static: true }) Resumo:           PoModalComponent | undefined
  @ViewChild('ttDadosConc')                        DadosSelecao!:    PoTableComponent
  @ViewChild('stepper')                            stepper!:         PoStepperComponent
  @ViewChild('pesoLiqInput')                       pesoLiqInput!:    ElementRef
  @ViewChild('timer',            { static: true }) telaTimer:      | PoModalComponent | undefined

  //--- Serviços injetados
  private srvTotvs        = inject(TotvsService)
  private srvExcel        = inject(ExcelService)
  private srvNotification = inject(PoNotificationService)
  private srvDialog       = inject(PoDialogService)
  private formConsulta    = inject(FormBuilder)
  private router          = inject(Router)
  
  //--- Formulario
  public form = this.formConsulta.group({
    serieSaida:  ['', Validators.required],
    pesoLiquido: ['', Validators.required],
    pesoBruto:   ['', Validators.required],
    volume:      ['', Validators.required],
    modal:       ['', Validators.required],
    codTranspnf: ['', Validators.required],
    observacao:  ['', Validators.required],
  });

  //--- Opções de Modal
  modalOptions = [
    { label: 'Aéreo',     value: 'aereo' },
    { label: 'Terrestre', value: 'terrestre' }
  ];

  //--- Opcoes Grid
  opcoesGridConsolida: Array<any> = [
    { label: '', icon: 'bi bi-trash', action: this.onDeletarRegistroConsolida.bind(this) }
  ]
  opcoesGridPeso: Array<any> = [
    { label: '', icon: 'bi bi-eraser', action: this.onEditItem.bind(this) }
  ]
  opcoesGridFaturados: Array<any> = [

  ]
  opcoesGridResumo: Array<any> = [
    { label: '', tooltip: "Desmarcar", icon: 'bi bi-x-square', action: this.onDesmarcarRegistroResumo.bind(this) }
  ]
  opcoesGrid: Array<any> = [

  ]
  customLiterals: PoTableLiterals = {
    noData: 'Infome os filtros para Buscar os Dados',
  };
  

  //-- ngOnInit inicial da tela
  ngOnInit(): void {

    this.totSelecionado[3] = "Calcular"
    this.totSelecionado[4] = "Calcular"

    //Obter Colunas do Grid
    this.colunasSelecao          = this.srvTotvs.obterColunasSelecao()
    this.colunasSelecaoItens     = this.srvTotvs.obterColunasSelecaoItens()
    this.colunasSelecaoItensPeso = this.srvTotvs.obterColunasSelecaoItensPeso()
    this.colunasConsolida        = this.srvTotvs.obterColunasConsolida()
    this.colunasConsolidaExec    = this.srvTotvs.obterColunasConsolidaExec()
    this.colunasConsolidaFat     = this.srvTotvs.obterColunasConsolidaFat()
    this.colunasConsolidaItens   = this.srvTotvs.obterColunasConsolidaItems()
    this.colunasFaturados        = this.srvTotvs.obterColunasFaturado()

    //Informacoes iniciais tela
    this.srvTotvs.EmitirParametros({ tituloTela: 'COCKPIT DE PEDIDOS - DASHBOARD', abrirMenu: false })

    //Carregar combo de estabelecimentos
    this.placeHolderEstabelecimento = 'Aguarde, carregando lista...'
    this.srvTotvs.ObterEstabelecimentos().subscribe({
      next: (response: any) => {

        //Carrega combo com a lista de estabelecimentos
        this.listaEstabelecimentos = (response as any[]).sort(this.ordenarCampos(['label']))

        //Seta label dos combos
        this.placeHolderEstabelecimento = 'Selecione um estabelecimento'
        this.loadTecnico      = 'Selecione um estabelecimento primeiro'
        this.loadTransp       = 'Selecione um estabelecimento primeiro'
        this.loadPrioridade   = 'Selecione um estabelecimento primeiro'
        this.loadConsolidacao = 'Selecione uma Consolidação'
        this.loadFaturados    = 'Selecione um Faturado'

        //Zera a lista selecionada
        if (this.listaSelecaoFiltrada.length === 0){
          this.listaSelecionados      = []
          this.listaSelecionadosItens = []
        }

      },
      error: (e) => {
        this.srvNotification.error(e.message)
        return
      },
      complete: () => {
        /*
        //FAS - Aqui apagar depois
        this.codEstabelecimento = "101"
        this.onEstabChange(this.codEstabelecimento)
        this.stepper.next()
        this.stepper.next()
        this.stepper.next()
        this.stepper.next()
        this.dthrAlt = new Date(2025, 10, 24)
        //FAS - Aqui apagar depois
        */
      }

    })

  }
  //-- ngOnInit inicial da tela 

  //--- Obter dados do Resumo
  verificarResumo() {
      this.loadTela = true
      
      let paramsNota: any = {NrConsolidacao: this.consolidacao};
      this.srvTotvs.ObterResumo(paramsNota).subscribe({

        next: (response: any) => {
          this.listaErros       = response.erros
          this.cMensagemErroRPW = response.rpw[0].mensagemRPW
        },
        error: (e) => {
          //this.srvNotification.error('Ocorreu um erro na requisição')
          this.loadTela = false
          return
        },
        complete: () => {
          this.loadTela = false
        }

      })

  }

  //--- Arquivo de Resumo Final
  onResumoFinal(obj:any){
    
    //this.pageActions = [
    //  { label: 'Voltar',    icon: 'po-icon-arrow-left', action: () => this.voltar()},
    //  { label: 'Atualizar', icon: 'po-icon-arrow-left', action: () => this.verificarNotas()},
    //]
    this.loadTela         = true
    this.listaErros       = []
    this.cMensagemErroRPW = ''
    this.consolidacao     = history.state.consolidacao
    this.colunasErro      = this.srvTotvs.obterColunasErrosProcessamento()

    //if(obj.situacao.toUpperCase() === "L")
      this.consolidacao = obj.nrConsolidacao
      this.verificarResumo()
      this.Resumo?.open()
    //this.loadTela = false
      //this.AbrirTela(obj, 'resumofinal')
    //else
      //this.srvNotification.error("Situação do processo não permite chamar esta tela !")
  }

  //--- Abrir tela de Resumo Final
  AbrirTela(obj:any, cTela:string){
      this.loadTela=true
      //Setar Estabelecimento e Usuario utilizado no calculo
      //this.srvTotvs.SetarUsuario(obj["cod-estabel"], obj["cod-emitente"], obj["nr-process"])
      //Parametros da Nota
      //let paramsTec: any = {codEstabel: obj["cod-estabel"], codTecnico: obj["cod-emitente"]};
      //Chamar Método
      //this.srvTotvs.ObterNrProcesso(paramsTec).subscribe({
      //  next: (response: any) => {
          //Atualizar Informacoes Tela
      //    let estab = this.listaEstabelecimentos.find((o) => o.value === this.codEstabel);
      //    this.srvTotvs.EmitirParametros({estabInfo: estab.label, tecInfo: `${obj['cod-emitente']} ${obj['nome-abrev']}`, processoInfo:response.nrProcesso, processoSituacao: response.situacaoProcesso})
          this.router.navigate([cTela], {
                                          state: { consolidacao: obj.nrConsolidacao }
                                        }
                              )
      //  },
      //})
    }

  //--- Reprocessar Faturamento
  onReprocessarFat(obj:any) {
  
    if (obj.descPedExec.toUpperCase().includes('EXECUTANDO PEDIDO') || obj.descPedExec.toUpperCase().includes('ENFILEIRADO')){
      this.srvNotification.error('Não é permitido o reprocessamento com RPW em execução !')
      return
    }

    this.srvDialog.confirm({
      title: 'REPROCESSAR FATURAMENTO',
      message:
        "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> CONFIRMA REPROCESSAMENTO ?</span></div><p>O reprocessamento só deve ser usado com a certeza da parada do processamento normal.</p>",    
      confirm: () => {
        
        //let params: any = { paramsTela: {codEstab: obj['cod-estabel'], codEmitente: obj['cod-emitente'], nrProcess: obj['nr-process']},}
        if (obj.lFaturado === "Não"){

          this.loadTela       = true
          this.nrConsolidacao = obj.nrConsolidacao
          this.onChangeFaturar()
          
        }
      },
      cancel: () => this.srvNotification.error('Cancelada pelo usuário'),
    })
  }
  //--- Usado para obter dados ao expandir os detalhes do Grid
  public mostrarDetalhe(row: any, index: number) {
    return true;
  }
  
  //--- Obter os itens selecionados ao expandir o Grid
  public ObterItensSelecionados(obj: any) {
    this.listaSelecionadosItensFiltro = this.listaSelecionadosItens.filter(item => item.nrPedido === obj.nrPedido)    
  }
  
  //--- Obter os Itens selecionados ao expandir o Grid
  public ObterItensConsolida(obj: any) {
    this.listaConsolidaItensFiltro = this.listaConsolidaItens.filter(item => item.nrConsolidacao === obj.nrConsolidacao)
  }
  
  //--- Obter os Itens selecionados ao expandir o Grid
  public ObterItensFaturados(obj: any) {
    this.listaFaturadosItensFiltro = this.listaFaturadosItens.filter(item => item.nrConsolidacao === obj.nrConsolidacao)
  }

  //--- Desmarca registro do Grid de Resumo
  public onDesmarcarRegistroResumo(obj: any){

    this.srvDialog.confirm({
      title: 'ELIMINAR PEDIDO [' + obj.nrPedido + '] PARA CONSOLIDAÇÃO',
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> DESEJA DESMARCAR O PEDIDO PARA EFETUAR CONSOLIDAÇÃO ?</span></div>",
      literals: { "cancel": "Não", "confirm": "Sim" },
      confirm: () => {

        //Lista da tela de Resumo
        this.listaSelecionados = this.listaSelecionados.filter(p => p.nrPedido !== obj.nrPedido) 

        //Desmarca o selecionado no grid de Seleção
        const item = this.listaSelecaoFiltrada.find(i => i.nrPedido === obj.nrPedido);
        if (item) {
          item['$selected'] = false;
        }

        const index = this.selectedRows.findIndex(item => item.nrPedido === obj.nrPedido)
        if (index >= 0) {
          // Já está selecionado → desmarca
          this.selectedRows.splice(index, 1)
          
        }        
        else {
          // Adiciona novamente na lista caso excluir
          //this.listaSelecaoFiltrada.push(obj)
        }

        // Força atualização do array para o Angular detectar mudança
        this.listaSelecaoFiltrada = [...this.listaSelecaoFiltrada]        

      },
      cancel: () => { }
    })

  }


  //--- Deletar registro do Grid de Consolidação
  public onDeletarRegistroConsolida(obj: any) {

    this.srvDialog.confirm({
      title: 'ELIMINAR PEDIDO [' + obj.nrPedido + '] DA CONSOLIDAÇÃO',
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> DESEJA ELIMINAR DA CONSOLIDAÇÃO " + obj.nrConsolidacao + "?</span></div>",
      literals: { "cancel": "Não", "confirm": "Sim" },
      confirm: () => {

        //Encontrar o indice da linha a ser excluida
        let index = this.listaConsolidaItensFiltro.findIndex(o => o.nrPedido === obj.nrPedido)
        let id    = this.listaConsolidaItensFiltro.find(o => o.nrPedido === obj.nrPedido)
        this.listaConsolidaItensFiltro.splice(index, 1);

        //Atualizar a lista para refresh de tela
        this.listaConsolidaItensFiltro = [...this.listaConsolidaItensFiltro]

        //Ordena a Lista
        this.listaConsolidaItensFiltro = (this.listaConsolidaItensFiltro as any[]).sort(this.ordenarCampos(['nrConsolidacao']))

        //Atualiar label de tela
        let param: any = { nrConsolidacao: id.nrConsolidacao, nrPedido: id.nrPedido, codEstabel: this.codEstabelecimento }

        //Apagar na base
        this.srvTotvs.EliminarPorId(param).subscribe({ next: (response: any) => { } })

        //Limpa as listas
        this.listaConsolidacao    = []
        this.listaFaturamento     = []
        this.listaConsolidaFiltro = []

        //Recarrega os Dados do Estabelecimento selecionado
        this.onEstabChange(this.codEstabelecimento)
        delay(200)

        this.srvNotification.success("Pedido [" + id.nrPedido + "] eliminado da Consolidação [" + id.nrConsolidacao + "] com sucesso !")
      },
      cancel: () => { }
    })

  }
  //--- Deletar registro do Grid de Consolidação
  
  //--- Calculo do Frete
  public onCalcFrete() {

    if (this.listaSelecionados.length === 0) { 
      this.srvNotification.error('Nenhum pedido foi selecionado');
      return 
    }

    this.loadTela      = true
    this.labelLoadTela = "Calculando Frete"
    
    let paramsTela: any = { codEstabel: this.codEstabelecimento, items: [...this.listaSelecionados] }

    this.srvTotvs.ObterCalculoFrete(paramsTela).subscribe({ 
      next: (response: any) => {

        if (response && response.items && response.items.length > 0) {

          this.totSelecionado[3] = response.items[0].totFretes
          this.totSelecionado[4] = response.items[0].totTransit
         
        }
        else {
          
          this.totSelecionado[3] = "Calcular"
          this.totSelecionado[4] = "Calcular"
          
        }       

      },
      error: (e) => this.loadTela = false,
    });
    
    this.loadTela = false
    
  }
  //--- Calculo do Frete

  //--- Chama Ffaturar Embarque
  public onFaturarEmbarque() {
    
    this.ChamaFaturar?.close()
    this.loadTela      = true
    this.labelLoadTela = "Faturando Embarque"

    //Inicializar acompanhamento rpw
    this.numPedExec.update(() => 1)
    
    let paramsTela: any = { codEstabel: this.codEstabelecimento, nrConsolidacao: this.nrConsolidacao, params: this.form.value}
    this.srvTotvs.FaturarEmbarque(paramsTela).subscribe({ //ponto 1
      next: (response: any) => {
        //this.loadTela = false
        this.srvNotification.success("Pedido e Execução [" + response.pedExec + "] Gerado para a Consolidação [" + this.nrConsolidacao + "]")
      
        //Acompanhar rpw
        if (response.pedExec !== undefined){
            this.numPedExec.update(() => response.pedExec)
        }
        else {
            this.numPedExec.update(() => 0)
        }       

      },
      error: (e) => this.loadTela = false,
      complete: () => {
          this.loadTela = false
          this.ChamaFaturar?.close()
          
          //Carrega Totais
          this.onEstabChange(this.codEstabelecimento)
          
          //this.srvNotification.success("Consolidação [" + this.nrConsolidacao + "] Faturada com sucesso ! NF[] Geradas")

          //Próximo passo
          this.stepper.next()

        }

      })
      
  }
  
  //--- Chama tela de Faturar
  public onChangeFaturar() {

    //this.atualizaComboConsolidacao()      
    if ((this.nrConsolidacao === '' || this.nrConsolidacao === undefined)) {
      this.srvNotification.error('Consolidação não foi selecionada')
      this.loadTela = false
      return
    }

    this.srvDialog.confirm({
      title: 'Faturar Consolidação [' + this.nrConsolidacao + ']?',
      message: 'Deseja realmente Faturar a Consolidação [' + this.nrConsolidacao + ']?',

      confirm: () => {
        this.loadTela      = true
        this.labelLoadTela = "Faturando"

        //Seta modal inicial
        this.form.controls['modal'].setValue("terrestre")
        this.form.controls['codTranspnf'].setValue("435")

        //Setar Valores Padrao
        this.srvTotvs.ObterParamsDoEstabelecimento(this.codEstabelecimento).subscribe({
          next: (response:any) => {
            if(response === null) {
              this.srvNotification.error("Cadastro para filial não encontrado ! Verifique os Parâmetros da Filial" )
              this.stepper?.first()
            }
            
              this.paramsEstab = response !== null ? response.items[0]: null
              if (this.paramsEstab !== null){
                this.serieSaida   = this.paramsEstab.serieSai
              }

              //Chama tela de Parâmetros do Faturamento
              this.ChamaFaturar?.open()

          },
          error: (e) => this.srvNotification.error("Ocorreu um erro na requisição " ),
          complete: () => {
            this.loadTela = false
          } 
        })
        
      },
      cancel: () => { this.loadTela = false }

    })

  }
  //--- Faturar

  //--- Mudar de Step
  public onProximoStep() {
    //Fecha as Modal
    this.detailsModalCon?.close()
    this.detailsModalTot?.close()
    this.detailsModalPend?.close()

    //Próximo passo
    this.stepper.next()

    //Atualiza combo de consolidação concatenando os dados
    this.atualizaComboConsolidacao(this.listaConsolidaFiltro)
    this.atualizaComboConsolidacao(this.listaFaturadosFiltro)
    this.atualizaComboConsolidacao(this.listaExecutandoFiltro)
  }
  //--- Mudar de Step

  //--- Chame este método sempre que o grid for recarregado/atualizado.
  public atualizaComboConsolidacao(selecionados: any[]) {

    // Mapa para garantir unicidade e contagem
    const counts = selecionados.reduce<Map<string, number>>((acc, item) => {
      const nrRaw = item.nrConsolidacao?.toString().trim()
      const nr = Number(nrRaw);

      this.valConsolidado = item.lConsolidado?.toString().trim()

      if (isNaN(nr)) return acc;

      const emitente = item.descEmitente?.trim() ?? '';
      const transp = item.nomTransp?.trim() ?? '';
      const key = `${nr} - ${emitente} - ${transp}`;

      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map());

    // Ordena numericamente pelo nrConsolidacao
    const unicosOrdenados = Array.from(counts.keys()).sort((a, b) => {
      const nrA = Number(a.split(' - ')[0]);
      const nrB = Number(b.split(' - ')[0]);
      return nrA - nrB;
    });

    // Monta as opções do combo
    if (this.valConsolidado === "Não") {
      this.listaConsolidacao = [
        { label: 'Todos', value: null }, ...unicosOrdenados.map(label => {
          const nr = Number(label.split(' - ')[0]);
          return { label, value: nr };
        })
      ]
    }
    else{
      this.listaFaturamento = [
        { label: 'Todos', value: null }, ...unicosOrdenados.map(label => {
          const nr = Number(label.split(' - ')[0]);
          return { label, value: nr };
        })
      ]  
    }
  }
  //--- Chame este método sempre que o grid for recarregado/atualizado.

  //--- Abre modal para editar
  onEditItem(item: any) {
    this.selectedItem = { ...item }; // Clona para não alterar direto
    this.alteraPeso?.open()
    
    setTimeout(() => {
      this.pesoLiqInput.nativeElement.focus();
      this.pesoLiqInput.nativeElement.select(); // Seleciona todo o texto
    }, 300)

  }

  //--- Salva alteração do peso
  saveItem(modal: any) {

    this.srvDialog.confirm({
      title: 'Efetivar Alteração de Peso',
      message: 'Deseja realmente Efetivar a Alteração de Peso do Item ?',
    
      confirm: () => {
        // Atualiza item na lista
        const index = this.listaSelecionadosItensPeso.findIndex(i => i.itCodigo === this.selectedItem.itCodigo);
        
        if (index > -1) {
          // Formata para 5 casas decimais e vírgula
          this.listaSelecionadosItensPeso[index].pesoLiq = parseFloat(this.selectedItem.pesoLiq.toString().replace(',', '.')).toFixed(5).replace('.', ',');
          this.listaSelecionadosItensPeso[index].pesoBru = parseFloat(this.selectedItem.pesoBru.toString().replace(',', '.')).toFixed(5).replace('.', ',');
        }

        this.loadTela      = true
        this.labelLoadTela = "Alterando Peso"

        let paramsTela: any = { items: [...this.listaSelecionadosItensPeso] }
        this.srvTotvs.ObterPesoItem(paramsTela).subscribe({ //ponto 1
          next: (response: any) => {
            
          },
          error: (e) => {
            this.loadTela = false
          },
          complete:() => {
            this.loadTela = false
          }
        })
        this.alteraPeso?.close()  
      }, 
      cancel: () => { }
    
    })
    
  }

  //--- Peso do Item
  onPesoItem(){

    if (this.listaSelecionados.length === 0) { 
      this.srvNotification.success("Não existe item com peso zerado!")  
      return 
    }
    
    // Pega os números dos pedidos selecionado
    const pedidosSelecionados = this.listaSelecionados.map(p => p.nrPedido)

    // Filtra apenas os itens dos pedidos selecionados
    const todosItens = this.listaSelecionadosItens.filter(item => pedidosSelecionados.includes(item.nrPedido))
    
    // Remove duplicados pelo código do item (itCodigo)
    const itensUnicos = todosItens.filter((item, index, self) => index === self.findIndex(i => i.itCodigo === item.itCodigo))

    // Agora aplica o filtro para pesoLiq e pesoBru = 0
    this.listaSelecionadosItensPeso = itensUnicos.filter(item => {
      const pesoLiq = parseFloat(item.pesoLiq.replace(",", "."));
      const pesoBru = parseFloat(item.pesoBru.replace(",", "."));
      return pesoLiq === 0 || pesoBru === 0;
    })
    
    // Só abre se houver itens
    if (this.listaSelecionadosItensPeso.length > 0) {
      this.ChamaPesoItem?.open()
    }

  }

  //--- Consolidar
  onChangeConsolidar() {

    if (this.listaSelecionados.length === 0) { return }

    // Pega os números dos pedidos selecionado
    const pedidosSelecionados = this.listaSelecionados.map(p => p.nrPedido)

    // Filtra apenas os itens dos pedidos selecionados
    const todosItens = this.listaSelecionadosItens.filter(item => pedidosSelecionados.includes(item.nrPedido))
    
    // Remove duplicados pelo código do item (itCodigo)
    const itensUnicos = todosItens.filter((item, index, self) => index === self.findIndex(i => i.itCodigo === item.itCodigo))

    const temPesoLiqVazio = itensUnicos.some(p => {
                              const peso = p.pesoLiq

                              // Converte para número (se possível)
                              const pesoNum = Number(peso.toString().replace(',', '.'))
                              return peso === null || peso === undefined || peso === '' || peso === '0,0000' || pesoNum === 0
                            })

    if (temPesoLiqVazio) {
      this.srvNotification.warning('Existem itens com Peso Líquido igual a zero. Verifique antes de continuar.')
      return
    }

    const temPesoBruVazio = itensUnicos.some(p => {
                              const peso = p.pesoBru

                              // Converte para número (se possível)
                              const pesoNum = Number(peso.toString().replace(',', '.'))
                              return peso === null || peso === undefined || peso === '' || peso === '0,0000' || pesoNum === 0
                            })
    if (temPesoBruVazio) {
      this.srvNotification.warning('Existem itens com Peso Bruto igual a zero. Verifique antes de continuar.')
      return
    }

    this.srvDialog.confirm({
      title: 'Efetivar Consolidação',
      message: 'Deseja realmente Efetivar a Consolidação ?',

      confirm: () => {
        this.loadTela      = true
        this.labelLoadTela = "Carregando Dados"

        let paramsTela: any = { codEstabel: this.codEstabelecimento, items: [...this.listaSelecionados] }
        this.srvTotvs.ObterConsolidar(paramsTela).subscribe({ //ponto 1
          next: (response: any) => {

            if (response && response.items && response.items.length > 0) {
              this.listaConsolidaItens = response.items
              this.listaConsolida      = Array.from(new Map(this.listaConsolidaItens.map(item => [item.nrConsolidacao, item])).values())

              //Ordena a Lista
              this.listaConsolidaItens = (this.listaConsolidaItens as any[]).sort(this.ordenarCampos(['nrConsolidacao']))
              this.listaConsolida      = (this.listaConsolida      as any[]).sort(this.ordenarCampos(['nrConsolidacao']))

              //Carrega a Lista de Filtro
              this.listaConsolidaFiltro = this.listaConsolida //1

              //Limpa a Lista de Selecionados
              this.listaSelecionados            = []
              this.listaSelecionadosItens       = []
              this.listaSelecionadosItensFiltro = []
            }
            else {
              this.listaConsolidaFiltro = []
              this.listaConsolidaItens  = []
              this.listaConsolida       = []
            }

            this.onEstabChange(this.codEstabelecimento)

            //Atualizar o Combo de consolidação pendente
            this.atualizaComboConsolidacao(this.listaConsolidaFiltro)

            //Vai para o próximo passo
            this.stepper.next()            

          },
          error: (e) => {
            this.loadTela = false
          }
        })
      },
      cancel: () => { }

    })

    this.loadTela = false  
  }
  //--- Consolidar
  
  //--- Marcar desmarcar linha
  changeOptions(selecionados: any[]) {

    this.listaSelecionados      = []
    //não posso limpar aqui senão zera a tablea de itens
    //this.listaSelecionadosItens = []

    const sel = this.DadosSelecao.getSelectedRows()
    this.totSelecionado[0] = String(sel.length) //this.DadosSelecao.getSelectedRows().length.toString()
    this.totSelecionado[1] = String(sel.reduce((acc, item) => acc + Number(item.qtdItens), 0)) //this.DadosSelecao.getSelectedRows().reduce((acc, item) => acc + Number(item.qtdItens), 0)
    this.totSelecionado[2] = sel.reduce((acc, item) => acc + parseFloat((item.vlItens || 0).toString().replace(',', '.')), 0).toFixed(2) //this.DadosSelecao.getSelectedRows().reduce((acc, item) => acc + parseFloat((item.vlItens || 0).toString().replace(',','.')), 0).toFixed(2)

    this.listaSelecionados = [...sel].sort(this.ordenarCampos(['codEmitente', 'codTransp']))

  }
  //--- Marcar desmarcar linha

  //--- Abre tela de Modal
  onOpenModal(type: any) {
    switch (type) {
      case 'Total':

        if (this.labelContadores[0] === "0") { return } //Não abre se não tiver dados
        
        this.tituloDetalhe = `Visão Total: ${this.labelContadores[0]} registros`
        this.colunasDetalhe = this.srvTotvs.obterColunasTotal()
        
        this.limparFiltro()

        this.detailsModalTot?.open();

      break
      case 'Pendentes':

        if (this.labelContadores[4] === "0") { return } //Não abre se não tiver dados

        this.tituloDetalhe = `Visão Pendentes: ${this.labelContadores[4]} registros`
        this.colunasDetalhe = this.srvTotvs.obterColunasTotal()
        
        this.limparFiltro()

        this.detailsModalPend?.open();
        
      break
      case 'Consolidado':

        if (this.labelContadores[5] === "0") { return } //Não abre se não tiver dados

        this.tituloDetalhe = `Visão Consolidado: ${this.labelContadores[5]} registros`
        this.colunasDetalhe = this.srvTotvs.obterColunasTotal()
        
        this.limparFiltro()

        this.detailsModalCon?.open();

      break

    }
  }
  //--- Abre tela de Modal

  //--- Change Estabelecimentos - Popular Emitente
  public onEstabChange(obj: string) {

    if (obj === undefined || obj === "") {

      //Zera as variaveis e listas e load
      this.listaTecnicos      = []
      this.listaTransp        = []
      this.labelContadores[0] = "0" //Total
      this.labelContadores[1] = "0" //Técnicos
      this.labelContadores[2] = "0" //Transferência
      this.labelContadores[3] = "0" //Remessa para Conserto
      this.labelContadores[4] = "0" //Pendentes
      this.labelContadores[5] = "0" //Consolidado
      this.labelContadores[6] = "0" //Separados
      this.labelContadores[7] = "0" //Expedidos
      this.loadTela           = false
      this.loadTecnico    = 'Selecione um estabelecimento primeiro'
      this.loadTransp     = 'Selecione um estabelecimento primeiro'
      this.loadPrioridade = 'Selecione um estabelecimento primeiro'
      return

    }

    //Popular o Combo do Emitente
    this.listaTecnicos = []
    this.codTecnico    = ''
    this.listaTecnicos.length = 0;
    this.loadTecnico = `Populando Emitente do estab ${obj} ...`

    this.loadTela      = true
    this.labelLoadTela = "Carregando Dados Emitente"

    
    this.srvTotvs.ObterEmitentesDoEstabelecimento(obj).subscribe({
      next: (response: any) => {
            delay(200)

        this.listaTecnicos = response
        this.loadTecnico = 'Selecione o Emitente'

      },
      error: (e) => {this.loadTecnico = 'Erro ao carregar Emitente'  }
    });

    //Popular o Combo do Transportadora
    this.listaTransp = []
    this.codTransp   = ''
    this.listaTransp.length = 0;
    this.loadTransp = `Populando Transportadora do estab ${obj} ...`

    this.srvTotvs.ObterTransportadoras().subscribe({
      next: (response: any) => {
        delay(200)

        this.listaTransp = response
        this.listaTranspFiltrada = [...this.listaTransp]
        this.loadTransp  = 'Selecione a Transportadora'
      },
      error: (e) => { this.loadTransp  = 'Erro ao carregar Transportadora' }
    });

    this.loadPrioridade = 'Prioridade'

    //Popular Faturados
    this.srvTotvs.ObterTotais(obj).subscribe({ //1
      next: (response: any) => {
        delay(200)

        this.listaSelecaoFiltrada      = []
        this.itemsDetalhe              = []
        this.listaSelecao              = []
        this.listaSelecionadosItens    = []
        //this.listaConsolidaFiltro      = []
        //this.listaConsolidaItensFiltro = []
        //this.listaFaturadosFiltro      = []
        //this.listaFaturadosItensFiltro = []
        
        if (response && response.pedidos && response.pedidos.length > 0) {
          this.itemsDetalhe          = response.pedidos
          this.listaSelecao          = response.pedidos
          this.listaSelecaoFiltrada  = response.pedidos
        }

        if (response && response.peditem && response.peditem.length > 0) {
          this.listaSelecionadosItens          = response.peditem 
        }

        /*
        if (response && response.faturados && response.faturados.length > 0) {
          this.listaFaturadosItens = response.faturados
          this.listaFaturados      = Array.from(new Map(this.listaFaturadosItens.map(item => [item.nrConsolidacao, item])).values())

          //Transforma em número
          this.listaFaturadosItens = this.listaFaturadosItens.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));
          this.listaFaturados      = this.listaFaturados.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));

          //Ordena a Lista
          this.listaFaturadosItens = (this.listaFaturadosItens as any[]).sort(this.ordenarCampos(['nrConsolidacao']))
          this.listaFaturados      = (this.listaFaturados      as any[]).sort(this.ordenarCampos(['nrConsolidacao']))
        }*/

        if (response && response.consolidar && response.consolidar.length > 0) { //ponto 2
          
          this.listaConsolidaItens = response.consolidar
          this.listaConsolida      = Array.from(new Map(this.listaConsolidaItens.map(item => [item.nrConsolidacao, item])).values())

          //Transforma em número
          this.listaConsolidaItens = this.listaConsolidaItens.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));
          this.listaConsolida      = this.listaConsolida.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));

          //Ordena a Lista
          this.listaConsolidaItens = (this.listaConsolidaItens as any[]).sort(this.ordenarCampos(['nrConsolidacao']))
          this.listaConsolida      = (this.listaConsolida      as any[]).sort(this.ordenarCampos(['nrConsolidacao']))

          //Carrega lista de Filtro
          this.listaConsolidaFiltro = this.listaConsolida.filter(item => item.lConsolidado === 'Não')
          //this.listaFaturadosFiltro = this.listaConsolida.filter(item => item.lConsolidado === 'Sim' /*&& (!item.lFaturado || item.lFaturado.trim() === '')*/ )

          if (response && response.pedidos && response.pedidos.length > 0) {
            this.itemsTotal = [...response.pedidos, ...response.consolidar.filter((item: any) => item.lFaturado === 'Não' || item.lFaturado === '')]
          }
          else {
            this.itemsTotal = [...response.consolidar]
          }

        }
        else {

          this.listaConsolida = []
          if (response && response.pedidos && response.pedidos.length > 0) {
            this.itemsTotal = [...response.pedidos]
          }

        }

        this.listaSelecao.forEach(item => { item.vlItens = parseFloat(item.vlItens.toString().replace(',', '.')) })
        this.listaSelecaoFiltrada.forEach(item => { item.vlItens = parseFloat(item.vlItens.toString().replace(',', '.')) })

        //zera a lista selecionada se não tiver mais dados
        if (this.listaSelecaoFiltrada.length === 0){
          this.listaSelecionados            = []
          //this.listaSelecionadosItens       = []
          this.listaSelecionadosItensFiltro = []
        }
        
        //Grava as informações
        this.labelContadores[0] = response.items[0].totGeral
        this.labelContadores[1] = response.items[0].totTecnicos
        this.labelContadores[2] = response.items[0].totTransf
        this.labelContadores[3] = response.items[0].totRemessa
        this.labelContadores[4] = response.items[0].totPendentes
        this.labelContadores[5] = response.items[0].totConsolidados
        this.labelContadores[6] = "N/A"
        this.labelContadores[7] = "N/A"

        //Limpa a lista selecionada
        this.listaSelecionados            = []
        //this.listaSelecionadosItens       = []
        this.listaSelecionadosItensFiltro = []
        //Atualizar o Combo de consolidação pendente
        this.atualizaComboConsolidacao(this.listaConsolidaFiltro)

        this.loadTela           = false

      },
      error: (e) => { this.loadTela = false }

    })    

    //Atualiza com a dataHora de Atualização da Tela
    this.ultatt = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })   
  
  }

  //--- Stepper
  public onChangeStep(obj: any) {    

    //Informacoes iniciais tela
    this.srvTotvs.EmitirParametros({ tituloTela: 'COCKPIT DE PEDIDOS - ' + obj.label + ' Estabelecimento [' + this.codEstabelecimento + ']', abrirMenu: false })

/*

    if ((this.StepAtual === "Dashboard" || this.StepAtual === "Seleção") && (obj.label === "Resumo" || obj.label === "Pré-Faturamento" || obj.label === "Faturados")){

      if ((!this.listaSelecionados || this.listaSelecionados.length === 0) && (!this.listaConsolida || this.listaConsolida.length === 0)){
        this.srvNotification.error('Nenhum pedido foi selecionado para Consolidação')
        this.stepper?.previous()
        return
      } 

    }

    if ((this.StepAtual === "Dashboard" || this.StepAtual === "Seleção" || this.StepAtual === "Resumo") && (obj.label === "Pré-Faturamento" || obj.label === "Faturados")){

      if ((!this.listaConsolida || this.listaConsolida.length === 0)){
        this.srvNotification.error('Efetivar a Consolidação para Avançar');
        this.stepper?.previous()
        return
      }

    }*/
    this.StepAtual = obj.label

  }
  //--- Stepper
  
  //--- Próximo Step
  public canActiveNextStep(passo: any): boolean {
    
    this.previousStep = this.currentStep
    this.currentStep  = passo.label
    
    if ((passo.label === "Dashboard") && (this.codEstabelecimento === '' || this.codEstabelecimento === undefined)) {
      this.srvNotification.error('Estabelecimento não foi selecionado');
      return false
    }

    /*
    if ((passo.label === "Seleção") && (!this.listaSelecionados || this.listaSelecionados.length === 0) && (!this.listaConsolida || this.listaConsolida.length === 0)){
      this.srvNotification.error('Nenhum pedido foi selecionado para Consolidação');
      return false
    }

    if ((passo.label === "Resumo") && (!this.listaConsolida || this.listaConsolida.length === 0)){
      this.srvNotification.error('Efetivar a Consolidação para Avançar');
      return false
    }
    */
    if (passo.label === 'Resumo') {
      this.atualizaComboConsolidacao(this.listaConsolidaFiltro)
      this.atualizaComboConsolidacao(this.listaFaturadosFiltro)
      this.atualizaComboConsolidacao(this.listaExecutandoFiltro)
    }

    if (passo.label === 'Pré-Faturamento') {
      this.atualizaComboConsolidacao(this.listaConsolidaFiltro)
      this.atualizaComboConsolidacao(this.listaFaturadosFiltro)
      this.atualizaComboConsolidacao(this.listaExecutandoFiltro)
      
      if (this.previousStep === "Resumo"){
        this.onFatChange()
      }

    }

    return true

  }
  //--- Próximo Step

  //Atualiza Faturados
  public onFatChange(){
      this.loadTela      = true
      this.labelLoadTela = "Carregando Faturados"

      let paramsTela: any = { codEstabel: this.codEstabelecimento, dthrAlt: this.dthrAlt}
      this.srvTotvs.ObterTotaisFat(paramsTela).subscribe({ //ponto 1
          next: (response: any) => {

            //this.listaFaturadosFiltro      = []
            //this.listaFaturadosItensFiltro = []

            if (response && response.faturados && response.faturados.length > 0) {
              this.listaFaturadosItens = response.faturados
              this.listaFaturados      = Array.from(new Map(this.listaFaturadosItens.map(item => [item.nrConsolidacao, item])).values())

              //Transforma em número
              this.listaFaturadosItens = this.listaFaturadosItens.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));
              this.listaFaturados      = this.listaFaturados.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));

              //Ordena a Lista
              this.listaFaturadosItens = (this.listaFaturadosItens as any[]).sort(this.ordenarCampos(['nrConsolidacao']))
              this.listaFaturados      = (this.listaFaturados      as any[]).sort(this.ordenarCampos(['nrConsolidacao']))

            }
            
            if (response && response.consolidar && response.consolidar.length > 0) { //ponto 2
          
              this.listaConsolidaItens = response.consolidar
              this.listaConsolida      = Array.from(new Map(this.listaConsolidaItens.map(item => [item.nrConsolidacao, item])).values())

              //Transforma em número
              this.listaConsolidaItens = this.listaConsolidaItens.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));
              this.listaConsolida      = this.listaConsolida.map(item => ({ ...item, nrConsolidacao: Number(item.nrConsolidacao) }));

              //Ordena a Lista
              this.listaConsolidaItens = (this.listaConsolidaItens as any[]).sort(this.ordenarCampos(['nrConsolidacao']))
              this.listaConsolida      = (this.listaConsolida      as any[]).sort(this.ordenarCampos(['nrConsolidacao']))

              //Carrega lista de Filtro
              //this.listaConsolidaFiltro = this.listaConsolida.filter(item => item.lConsolidado === 'Não')
              this.listaFaturadosFiltro  = this.listaConsolida.filter(item => item.lFaturado === 'Sim' /*&& (!item.lFaturado || item.lFaturado.trim() === '')*/ )
              this.listaExecutandoFiltro = this.listaConsolida.filter(item => item.lFaturado === 'Não' /*&& (!item.lFaturado || item.lFaturado.trim() === '')*/ )
              
              if (response && response.pedidos && response.pedidos.length > 0) {
                this.itemsTotal = [...response.pedidos, ...response.consolidar.filter((item: any) => item.lFaturado === 'Não' || item.lFaturado === '')]
              }
              else {
                this.itemsTotal = [...response.consolidar]
              }

            }
            else {

              this.listaConsolida = []
              if (response && response.pedidos && response.pedidos.length > 0) {
                this.itemsTotal = [...response.pedidos]
              }

            }
            this.loadTela = false
          },
          error: (e) => {
            this.loadTela = false
          },
          complete(){
            
          }

      })
  }

  //--- Change Transportadora
  public onTranspChange(obj: string) {
    this.transportadoraSelecionado = obj ? String(obj).split(' ')[0] : ''
    this.filtrarLista()
  }
  //--- Change Transportadora

  //--- Change Emitente
  public onEmitenteChange(obj: string) {
    this.emitenteSelecionado = obj ? String(obj).split(' ')[0] : ''
    this.filtrarLista()
  }
  //--- Change Emitente

  //--- Change Prioridade
  public onPrioridadeChange(obj: string) {
    this.prioridadeSelecionado = obj ? String(obj).split(' ')[0] : ''
    this.filtrarLista()
  }
  //--- Change Prioridade

  //--- Filtrar Consolidacao
  public onFiltrarConsolidacaoChange(obj: any) {

    this.listaConsolidaFiltro = this.listaConsolida.filter(item => {
      const filtroConsolida = obj ? Number(item.nrConsolidacao) === Number(obj) : true

      return filtroConsolida
    })

  }

  //--- Filtrar Faturados
   public onFiltrarFaturadosChange(obj: any) {

    this.listaFaturadosFiltro = this.listaFaturados.filter(item => {
      const filtroFaturados = obj ? Number(item.nrConsolidacao) === Number(obj) : true

      return filtroFaturados
    })

  }

  //--- Filtra Lista
  public filtrarLista() {
    this.listaSelecaoFiltrada = this.listaSelecao.filter(item => {
      const filtroEmitente = this.emitenteSelecionado ? item.codEmitente === this.emitenteSelecionado: true

      const filtroTransp = this.transportadoraSelecionado ? item.codTransp === this.transportadoraSelecionado: true

      const filtroPrioridade = this.prioridadeSelecionado ? item.indPrioridade === this.prioridadeSelecionado: true

      return filtroEmitente && filtroTransp && filtroPrioridade
    });

  }
  //--- Filtra Lista

  //--- Exportar lista filtrada para excel
  public onExportarSelecaoExcel() {
    let titulo = "LISTA DE PEDIDOS"
    let subTitulo = this.tituloDetalhe
    this.loadExcel = true

    //let valorForm: any = { valorForm: this.form.value }
    this.srvExcel.exportarParaExcel('SELEÇÃO: ' + titulo.toUpperCase(),
      subTitulo.toUpperCase(),
      this.colunasDetalhe,
      this.listaSelecaoFiltrada,
      'Pedidos_' + this.codEstabelecimento,
      this.codEstabelecimento)

    this.loadExcel = false;
  }
  //--- Exportar lista filtrada para excel

  //--- Exportar lista detalhe para excel
  public onExportarExcel() {
    let titulo = "LISTA DE PEDIDOS"
    let subTitulo = this.tituloDetalhe
    this.loadExcel = true

    //let valorForm: any = { valorForm: this.form.value }

    this.srvExcel.exportarParaExcel('DASHBOARD: ' + titulo.toUpperCase(),
      subTitulo.toUpperCase(),
      this.colunasDetalhe,
      this.itemsTotal,
      'Pedidos_' + this.codEstabelecimento,
      this.codEstabelecimento)

    this.loadExcel = false;
  }
  //--- Exportar lista detalhe para excel

  //--- Função para ordenar
  //Utilize o - (menos) para indicar ordenacao descendente
  ordenarCampos = (fields: any[]) => (a: { [x: string]: number; }, b: { [x: string]: number; }) => fields.map(o => {
    let dir = 1;
    if (o[0] === '-') { dir = -1; o = o.substring(1); }
    return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
  }).reduce((p, n) => p ? p : n, 0)
  //--- Função para Ordenar

  //--- Limpar filtro
  limparFiltro() {
    setTimeout(() => {
      let filtro = (document.querySelector('.po-search-input') as HTMLInputElement)
      if (filtro !== null && filtro !== undefined)
        filtro.value = ''

    }, 500)

  }
  //--- Limpar filtro

  //--- Chamar programa TOTVS
  onChamarPD1001() {
    let params = { RowId: "0x000000003f0f2186" }
    this.srvTotvs.AbrirProgramaTotvs(params).subscribe({
      next: (response: any) => {
       
      }
    })
  }
  //--- Chamar programa TOTVS

  //--- fora de uso
  
  //--- fora de uso

} //--- FIM