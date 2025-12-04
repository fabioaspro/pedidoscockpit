import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { delay, Subscription } from 'rxjs';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl} from '@angular/forms';
import { PoModule, PoTableColumn, PoTableModule, PoButtonModule, PoMenuItem, PoMenuModule, PoModalModule, PoPageModule, PoToolbarModule, PoTableAction, PoModalAction, PoDialogService, PoNotificationService, PoFieldModule, PoDividerModule, PoTableLiterals, PoTableComponent, PoModalComponent,} from '@po-ui/ng-components';
//import { escape } from 'querystring';
import { ExcelService } from '../../services/excel-service.service';
import { TotvsService } from '../../services/totvs-service.service';


@Component({
  selector: 'app-relmovto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
    PoModalModule,
    PoTableModule,
    PoModule,
    PoFieldModule,
    PoDividerModule,
    PoButtonModule,
    PoToolbarModule,
    PoMenuModule,
    PoPageModule,
    HttpClientModule,
  ],
  templateUrl: './relmovto.component.html',
  styleUrl: './relmovto.component.css'
})
export class RelmovtoComponent {

  @ViewChild('formSelecao', { static: true }) formSelecao!: UntypedFormControl;
  @ViewChild('telaSelecao', { static: true }) telaSelecao:  | PoModalComponent  | undefined;

  private srvTotvs        = inject(TotvsService)
  private srvExcel        = inject(ExcelService)
  private srvNotification = inject(PoNotificationService);
  private router          = inject(Router)

  //-- Variaveis do po-table
  listaFaturadosFiltro:              any[] = []
  alturaGridConsolidados:           number = window.innerHeight - 100
  colunasConsolidaFat:Array<PoTableColumn> = []
  listaFaturadosItensFiltro:         any[] = []
  listaFaturadosItens:               any[] = []
  colunasFaturados:   Array<PoTableColumn> = []
  loadTela:                        boolean = false

  readonly acaoSelecionar: PoModalAction = {
    label: 'Salvar',
    action: () => {
      this.telaSelecao?.close();
    },
  };

  readonly acaoCancelarSelecao: PoModalAction = {
    label: 'Cancelar',
    action: () => {
      this.telaSelecao?.close();
    },
  };

  //--- Usado para obter dados ao expandir os detalhes do Grid
  public mostrarDetalhe(row: any, index: number) {
    return true;
  }

  dtIni: string = <any>new Date();
  dtFim: string = <any>new Date();
  tecIni:string='0'
  tecFim:string='999999'
  tecDestIni:string='0'
  tecDestFim:string='999999'
  itCodigoIni:string=''
  itCodigoFim:string='ZZZZZZZZZZZZZZZZ'
  estabIni:string=''
  estabFim:string='ZZZ'


  alturaGrid:number=window.innerHeight - 250
  

  ngOnInit(): void {

    //Colunas grids
    //this.colunas = this.srvTotvs.obterColunasRelatorio();

    this.srvTotvs.EmitirParametros({ tituloTela: 'BPD - RELATÓRIO DE CONSOLIDAÇÃO'})
    this.colunasConsolidaFat     = this.srvTotvs.obterColunasConsolidaFat()
    //this.colunasConsolidaItens   = this.srvTotvs.obterColunasConsolidaItems()
    this.colunasFaturados        = this.srvTotvs.obterColunasFaturado()
  }

  //--- Obter os Itens selecionados ao expandir o Grid
  public ObterItensFaturados(obj: any) {
    this.listaFaturadosItensFiltro = this.listaFaturadosItens.filter(item => item.nrConsolidacao === obj.nrConsolidacao)
  }

  Detalhe(obj:any){

    //this.srvTotvs.SetarUsuario(obj["cod-estabel"], obj["cod-emit-ori"], obj["nr-process"])
    this.router.navigate(['dashboard'])

  }

  Selecionar(){
    this.loadTela=true
    let paramsTela: any = { paramsTela: this.formSelecao.value }

    this.srvTotvs.ObterDadosRelatorio(paramsTela).subscribe({
      next:(response:any)=>{
        if (response === null){
          this.listaFaturadosFiltro=[]
          this.srvNotification.warning("Não existe dados para o range de seleção !")
          return
        }
        this.listaFaturadosFiltro = response.items;
        this.loadTela=false
      },
      complete: ()=> {this.loadTela=false},
      error: ()=> {this.loadTela=false}
    })

  }


  GerarExcel(){

    this.srvExcel.exportarParaExcel('LISTA DE CONSOLIDAÇÃO',
                                    'Relatório Detalhado de Consolidação',
                                    this.colunasConsolidaFat,
                                    this.listaFaturadosFiltro,
                                    'Consolidação',
                                    'Dados')

  }

}
