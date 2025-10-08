import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { delay, Subscription } from 'rxjs';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl} from '@angular/forms';
import { PoModule, PoTableColumn, PoTableModule, PoButtonModule, PoMenuItem, PoMenuModule, PoModalModule, PoPageModule, PoToolbarModule, PoTableAction, PoModalAction, PoDialogService, PoNotificationService, PoFieldModule, PoDividerModule, PoTableLiterals, PoTableComponent, PoModalComponent,} from '@po-ui/ng-components';
import { ExcelService } from '../services/excel-service.service';
//import { escape } from 'querystring';
import { environment } from '../environments/environment'
import { TotvsService } from '../services/totvs-service.service';


@Component({
  selector: 'app-envhist',
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
  templateUrl: './envhist.component.html',
  styleUrl: './envhist.component.css'
})
export class EnvhistComponent {

  @ViewChild('formSelecao', { static: true }) formSelecao!: UntypedFormControl;
  @ViewChild('telaSelecao', { static: true }) telaSelecao:  | PoModalComponent  | undefined;

  private srvTotvs        = inject(TotvsService)
  private srvExcel        = inject(ExcelService)
  private srvNotification = inject(PoNotificationService);
  private router          = inject(Router)

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

  //---Variáveis de Grupo
  codGrupo: string = ''

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
  alturaStepperSel: number = window.innerHeight - 128
  //---Grid
  colunas!: PoTableColumn[]
  lista!: any[]
  listaDados!:any[]
  loadTela:boolean=false

  buttonDisabled!: boolean;
  progressBarValue = 0;
  publication: string = `1`;

  ultatt:           string = ''

  totalRegistros    = 8;
  registrosEnviados = 0;
  progressValue     = 0;

  periodoInicial!: Date

  atualizarProgresso() {
    this.progressValue = Math.floor((this.registrosEnviados / this.totalRegistros) * 100);
  }


  get progressBarInfo() {
    return `${this.progressBarValue}/100`;
  }

  
  ngOnAttEnvHist(){

    this.srvTotvs.onAttEnvHist({tabela: 'pr-consolida', dataini: '17/09/2025', datafim: '18/09/2025'}).subscribe({
        next: (response: any) => {
          this.registrosEnviados = this.totalRegistros - response.qtdEnv
          this.atualizarProgresso()

        },
        error: (e) => {
          this.loadTela = false
        },
      
    })

  }


  ngOnInit(): void {

    this.loadTela = true
  
    this.srvTotvs.EmitirParametros({ tituloTela: 'COCKPIT DE PEDIDOS - ENVIO DE DADOS PARA HISTÓRICO'})

    this.srvTotvs.ObterCadastro({tabela: 'codGrupo', codigo: 'paramHTML', item: 'BPD_codGrupoHist'}).subscribe({
        next: (response: any) => {
          this.codGrupo = response.desc
          if(this.codGrupo === "YES"){
            //Executa a tela
            this.loadTela = false
           }
          else{
            //Não tem acesso a tela
            this.srvNotification.error('(01) Usuário sem acesso a essa funcionalidade')
            this.router.navigate(['home']) //Volta a lista inicial

          }

        },
        error: (e) => {
          this.srvNotification.error('(02) Usuário sem acesso a essa funcionalidade')
          this.router.navigate(['home']) //Volta a lista inicial
          this.loadTela = false
        },
      
    })

  }

  //--Não usa
  /*
  Detalhe(obj:any){

    this.srvTotvs.SetarUsuario(obj["cod-estabel"], obj["cod-emit-ori"], obj["nr-process"])
    this.router.navigate(['dashboard'])

  }

  Selecionar(){
    this.loadTela=true
    let paramsTela: any = { paramsTela: this.formSelecao.value }

    this.srvTotvs.ObterDadosRelatorio(paramsTela).subscribe({
      next:(response:any)=>{
        if (response === null){
          this.lista=[]
          this.srvNotification.warning("Não existe dados para o range de seleção !")
          return
        }
        this.lista = response.items;
        this.loadTela=false
    },
      complete: ()=> {this.loadTela=false}
    })

  }


  GerarExcel(){

    this.srvExcel.exportarParaExcel('LISTA DE EMPRÉSTIMOS',
                                    'Relatório Detalhado de Empréstimos',
                                    this.colunas,
                                    this.lista,
                                    'Emprestimos',
                                    'Dados')

  }
  */

}
