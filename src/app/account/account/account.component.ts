import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { CmcService } from '../../services/cmc.service';
import { EosService } from '../../services/eos.service';
import { AppService } from '../../services/app.service';
import { Account, Action, Result } from '../../models';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, share, catchError, tap } from 'rxjs/operators';

interface AccountRaw extends Account {
  raw: any;
  balance: number;
  ramPrice: number;
  tokens: any[];
  abi?: {
    tables?: any[];
  };
}

@Component({
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  name$: Observable<string>;
  eosPrice$: Observable<number>;
  account$: Observable<Result<any>>;
  accountTokens$: Observable<any>;
  accountActionsSent$: Observable<Action[]>;
  accountActionsReceived$: Observable<Action[]>;

  constructor(
    private route: ActivatedRoute,
    private eosService: EosService,
    private accountService: AccountService,
    private cmcService: CmcService,
    public app: AppService
  ) { }

  ngOnInit() {
    this.name$ = this.route.params.pipe(
      map(params => params.id)
    );
    this.eosPrice$ = this.cmcService.getEosPrice();
    this.account$ = this.name$.pipe(
      switchMap(name => this.eosService.getAccountRaw(name)),
      tap(x => console.log('account', x))
    );
    this.accountTokens$ = this.name$.pipe(
      switchMap(name => this.accountService.getTokensRaw(name)),
      tap(x => console.log('tokens', x))
    );
    // this.account$ = this.name$.pipe(
    //   switchMap(name => this.accountService.getAccount(name).pipe(
    //     catchError(() => of({ name: name } as Account))
    //   )),
    //   switchMap(account => {
    //     return combineLatest(
    //       this.eosService.getAccount(account.name),
    //       this.eosService.getCurrencyBalance(account.name),
    //       this.eosService.getRamPrice(),
    //       this.accountService.getAccountTokens(account.name)
    //     ).pipe(
    //       map(([accountRaw, balance, ramPrice, tokens]) => {
    //         return {
    //           ...account,
    //           raw: accountRaw,
    //           balance: balance,
    //           ramPrice: ramPrice,
    //           tokens: tokens
    //         };
    //       })
    //     );
    //   }),
    //   share()
    // );
    this.accountActionsSent$ = this.name$.pipe(
      switchMap(name => this.accountService.getAccountActionsSent(name))
    );
    this.accountActionsReceived$ = this.name$.pipe(
      switchMap(name => this.accountService.getAccountActionsReceived(name))
    );
  }

}
