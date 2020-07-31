import { Component, OnInit } from '@angular/core';

import { Observable, Subject, BehaviorSubject } from 'rxjs';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { Item } from '../model/item';
import { ItemService } from '../service/item.service';

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: [ './item-search.component.css' ]
})
export class ItemSearchComponent implements OnInit {

  items$: Observable<Item[]>;
  private searchTerms = new BehaviorSubject<string>('');
  loadingState: string = '';

  constructor(private itemService: ItemService) {}

  // Push a search term into the observable stream.
  onEnter(term: string) { 
    if (term != '') {
      this.searchTerms.next('');
      this.loadingState = 'Searching, please wait...';
    } else {
      this.loadingState = '';
    }
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.items$ = this.searchTerms.pipe(

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.itemService.searchItems(term)),
    );

    this.items$.subscribe(x => {
      if(x.length == 0 && this.searchTerms.getValue() != '') {
        this.loadingState = 'It seems that no results were found, try something different.';
      }  
      
      if (x.length > 0) {
        this.loadingState = 'Showing ' + x.length + ' results...';
      }
    });
    
  }
  
}