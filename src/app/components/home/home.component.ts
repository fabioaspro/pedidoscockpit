import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, inject, signal } from '@angular/core';
import { PoMenuItem, PoModalAction, PoModalComponent, PoPageAction, PoRadioGroupOption, PoStepperComponent, PoTableAction, PoTableColumn, PoTableComponent, PoNotificationService, PoDialogService, PoNotification, PoButtonComponent, PoLoadingModule, PoStepperModule, PoWidgetModule, PoDividerModule, PoFieldModule, PoIconModule, PoTableModule, PoButtonModule, PoTooltipModule, PoRadioGroupModule, PoModalModule, PoModule, PoAccordionModule, PoTableLiterals, PoStepComponent, PoContainerModule, PoComboOption } from '@po-ui/ng-components';
import { TotvsService } from '../../services/totvs-service.service';
import { catchError, delay, elementAt, finalize, first, forkJoin, interval, of, Subscription } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExcelService } from '../../services/excel-service.service';
import { Usuario } from '../../interfaces/usuario';
import { TotvsService46 } from '../../services/totvs-service-46.service';
//import { BtnDownloadComponent } from '../btn-download/btn-download.component';
import { NgClass, NgIf, CurrencyPipe, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
//import { RpwComponent } from '../rpw/rpw.component';

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
    PoContainerModule
  ]
})
export class HomeComponent {

  //--- Loadings
  loadTela:  boolean = false
  loadExcel: boolean = false
  labelLoadTela:    string = ''
  loadTecnico:      string = ''
  loadTransp:       string = ''
  loadPrioridade:   string = ''
  loadConsolidacao: string = ''

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
  listaTranspFiltrada!: PoComboOption[] 
  listaConsolidacao!:           any[]
  listaSelecao:                 any[] = []
  listaSelecaoFiltrada:         any[] = []
  listaSelecionados:            any[] = []
  listaSelecionadosItens:       any[] = []
  listaSelecionadosItensFiltro: any[] = []
  listaConsolida:               any[] = []
  listaConsolidaFiltro:         any[] = []
  listaConsolidaItens:          any[] = []
  listaConsolidaItensFiltro:    any[] = []
  listaFaturados:               any[] = []

  //--- Colunas dos Grids
  colunasSelecao:        Array<PoTableColumn> = []
  colunasSelecaoItens:   Array<PoTableColumn> = []
  colunasConsolida:      Array<PoTableColumn> = []
  colunasConsolidaItens: Array<PoTableColumn> = []
  colunasFaturados:      Array<PoTableColumn> = []

  //--- Controle de Modal
  lHideSearch: boolean = false

  //--- Informacoes Dialog Grids (Resumo)
  colunasDetalhe: Array<PoTableColumn> = []
  tituloDetalhe!: string
  itemsDetalhe!:  any[]
  itemsTotal!:    any[]
  
  //--- Variaveis Combobox
  codEstabelecimento:          string = ''
  codTecnico:                  string = ''
  codTransp:                   string = ''
  nrConsolidacao:              string = ''
  indPrioridade:               string = ''
  indConsolidacao:             string = ''
  placeHolderEstabelecimento!: string

  //--- Referencias 
  @ViewChild('detailsModalTot',  { static: true }) detailsModalTot:  PoModalComponent | undefined
  @ViewChild('detailsModalPend', { static: true }) detailsModalPend: PoModalComponent | undefined
  @ViewChild('detailsModalCon',  { static: true }) detailsModalCon:  PoModalComponent | undefined
  @ViewChild('ChamaFaturar',     { static: true }) ChamaFaturar:     PoModalComponent | undefined
  @ViewChild('ttDadosConc')                        DadosSelecao!:    PoTableComponent
  @ViewChild('stepper')                            stepper!:         PoStepperComponent

  //--- Serviços injetados
  private srvTotvs        = inject(TotvsService)
  private srvExcel        = inject(ExcelService)
  private srvNotification = inject(PoNotificationService)
  private srvDialog       = inject(PoDialogService)
  private formConsulta    = inject(FormBuilder)

  //--- Formulario
  public form = this.formConsulta.group({
    pesoLiquido: ['', Validators.required],
    pesoBruto:   ['', Validators.required],
    volume:      ['', Validators.required],
    modal:       ['', Validators.required],
    codTransp:   ['', Validators.required],
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
  opcoesGridFaturados: Array<any> = [

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
    this.colunasSelecao        = this.srvTotvs.obterColunasSelecao()
    this.colunasSelecaoItens   = this.srvTotvs.obterColunasSelecaoItens()
    this.colunasConsolida      = this.srvTotvs.obterColunasConsolida()
    this.colunasConsolidaItens = this.srvTotvs.obterColunasConsolidaItems()
    this.colunasFaturados      = this.srvTotvs.obterColunasFaturado()

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

        //Zera a lista selecionada
        if (this.listaSelecaoFiltrada.length === 0){
          this.listaSelecionados      = []
          this.listaSelecionadosItens = []
        }

      },
      error: (e) => {
        this.srvNotification.error(e.message)
        return
      }
    })

  }
  //-- ngOnInit inicial da tela 

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
  //--- Usado para obter dados ao expandir os detalhes do Grid

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

  //--- Chama faturar Embarque
  public onFaturarEmbarque() {
    
    let paramsTela: any = { codEstabel: this.codEstabelecimento, nrConsolidacao: this.nrConsolidacao }
    this.srvTotvs.FaturarEmbarque(paramsTela).subscribe({ //ponto 1
      next: (response: any) => {
      
        console.log(response)
      
      },
        error: (e) => this.loadTela = false,
      });
      
  }
  
  //--- Chama tela de Faturar
  public onChangeFaturar() {

    //this.atualizaComboConsolidacao()      
    if ((this.nrConsolidacao === '' || this.nrConsolidacao === undefined)) {
      this.srvNotification.error('Consolidação não foi selecionada');
      return
    }

    this.srvDialog.confirm({
      title: 'Faturar Consolidação',
      message: 'Deseja realmente Faturar a Consolidação [' + this.nrConsolidacao + ']?',

      confirm: () => {
        this.loadTela      = true
        this.labelLoadTela = "Faturando"

        //Seta modal inicial
        this.form.controls['modal'].setValue("terrestre")

        //Chama tela de Faturamento
        this.ChamaFaturar?.open()
        /*
        let paramsTela: any = { codEstabel: this.codEstabelecimento, items: [...this.listaSelecionados] }

        this.srvTotvs.ObterConsolidar(paramsTela).subscribe({ //ponto 1
          next: (response: any) => {

            delay(200)
            
            if (response && response.items && response.items.length > 0) {
              this.listaConsolidaItens = response.items
              this.listaConsolida      = Array.from(new Map(this.listaConsolidaItens.map(item => [item.nrConsolidacao, item])).values())

              //Ordena a Lista
              this.listaConsolidaItens = (this.listaConsolidaItens as any[]).sort(this.ordenarCampos(['nrConsolidacao']))
              this.listaConsolida      = (this.listaConsolida as any[]).sort(this.ordenarCampos(['nrConsolidacao']))
          
              this.listaConsolidaFiltro= this.listaConsolida

              this.listaSelecionados = []
              
            }
            else this.listaConsolida = []

            this.onEstabChange(this.codEstabelecimento)

            delay(200)
                
            this.stepper.next()

          },
          error: (e) => this.loadTela = false,
        });*/
        this.loadTela = false
      },
      cancel: () => { }

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
    this.atualizaComboConsolidacao()
  }
  //--- Mudar de Step

  //--- Chame este método sempre que o grid for recarregado/atualizado.
  public atualizaComboConsolidacao() {

    // Mapa para garantir unicidade e contagem
    const counts = this.listaConsolida.reduce<Map<string, number>>((acc, item) => {
      const nrRaw = item.nrConsolidacao?.toString().trim();
      const nr = Number(nrRaw);

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
    this.listaConsolidacao = [
      { label: 'Todos', value: null }, ...unicosOrdenados.map(label => {
        const nr = Number(label.split(' - ')[0]);
        return { label, value: nr };
      })
    ]

  }
  //--- Chame este método sempre que o grid for recarregado/atualizado.

  //--- Consolidar
  onChangeConsolidar() {

    if (this.listaSelecionados.length === 0) { return }
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
              this.listaConsolidaFiltro = this.listaConsolida

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
            this.atualizaComboConsolidacao()

            //Vai para o próximo passo
            this.stepper.next()            

          },
          error: (e) => {
            this.loadTela = false
          }
        });
      },
      cancel: () => { }

    })

    this.loadTela = false  
  }
  //--- Consolidar
  
  //--- Marcar desmarcar linha
  changeOptions(selecionados: any[]) {

    const sel = this.DadosSelecao.getSelectedRows()
    this.totSelecionado[0] = String(sel.length) //this.DadosSelecao.getSelectedRows().length.toString()
    this.totSelecionado[1] = String(sel.reduce((acc, item) => acc + Number(item.qtdItens), 0)) //this.DadosSelecao.getSelectedRows().reduce((acc, item) => acc + Number(item.qtdItens), 0)
    this.totSelecionado[2] = sel.reduce((acc, item) => acc + parseFloat((item.vlItens || 0).toString().replace(',', '.')), 0).toFixed(2) //this.DadosSelecao.getSelectedRows().reduce((acc, item) => acc + parseFloat((item.vlItens || 0).toString().replace(',','.')), 0).toFixed(2)

    this.listaSelecionados = [...sel].sort(this.ordenarCampos(['codEmitente', 'codTransp']))

    //osni
    //this.listaSelecionadosItens = []

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

    //Popular o DashBoard
    this.srvTotvs.ObterTotais(obj).subscribe({ //1
      next: (response: any) => {
        delay(200)

        this.listaSelecaoFiltrada   = []
        this.itemsDetalhe           = []
        this.listaSelecao           = []
        this.listaSelecionadosItens = []
        this.listaFaturados         = []

        if (response && response.pedidos && response.pedidos.length > 0) {
          this.itemsDetalhe          = response.pedidos
          this.listaSelecao          = response.pedidos
          this.listaSelecaoFiltrada  = response.pedidos
        }

        if (response && response.peditem && response.peditem.length > 0) {
          this.listaSelecionadosItens          = response.peditem          
        }

        if (response && response.faturados && response.faturados.length > 0) {
          this.listaFaturados = response.faturados
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
          this.listaConsolidaFiltro = this.listaConsolida

          if (response && response.pedidos && response.pedidos.length > 0) {
            this.itemsTotal = [...response.pedidos, ...response.consolidar]
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
        this.atualizaComboConsolidacao()

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
      this.atualizaComboConsolidacao()
    }

    if (passo.label === 'Pré-Faturamento') {
      this.atualizaComboConsolidacao()
    }

    return true

  }
  //--- Próximo Step

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
    });

  }
  //--- Filtrar Consolidacao

  //--- Filtra Lista
  public filtrarLista() {
    this.listaSelecaoFiltrada = this.listaSelecao.filter(item => {
      const filtroEmitente = this.emitenteSelecionado
        ? item.codEmitente === this.emitenteSelecionado
        : true;

      const filtroTransp = this.transportadoraSelecionado
        ? item.codTransp === this.transportadoraSelecionado
        : true;

      const filtroPrioridade = this.prioridadeSelecionado
        ? item.indPrioridade === this.prioridadeSelecionado
        : true;

      return filtroEmitente && filtroTransp && filtroPrioridade;
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
  }).reduce((p, n) => p ? p : n, 0);
  //--- Função para Ordenar

  //--- Limpar filtro
  limparFiltro() {
    setTimeout(() => {
      let filtro = (document.querySelector('.po-search-input') as HTMLInputElement)
      if (filtro !== null && filtro !== undefined)
        filtro.value = ''

    }, 500);

  }
  //--- Limpar filtro

  //--- Chamar programa TOTVS
  onChamarPD1001() {
    let params = { RowId: "0x000000003f0f2186" }
    this.srvTotvs.AbrirProgramaTotvs(params).subscribe({
      next: (response: any) => {
        //console.log(response)
      }
    })
  }
  //--- Chamar programa TOTVS

  //--- fora de uso
  
  //--- fora de uso

} //--- FIM