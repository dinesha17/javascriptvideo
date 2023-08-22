import { Component, OnInit, ViewChild, Output, EventEmitter, Inject, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormBuilder, FormGroup, FormArray, Validators, NgForm, Form } from '@angular/forms';
import { Router } from "@angular/router";
import { DOCUMENT } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmationDialogComponent } from '../../../shared/layout/confirmation-dialog/confirmation-dialog.component';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { MappingService } from './mapping.service'
import { HttpClient } from '@angular/common/http';
import { ComponentLoaderService } from 'src/app/core/services/component-loader.service';
export interface UseRoleListData {

  userId: number;

}
export interface transferData {

  userId: number;

}

const ELEMENT_DATA: UseRoleListData[] = [];

@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss']
})




export class MappingComponent implements OnInit {



  selectedRow: any;
  dataSource: any;
  length: any = 0;
  pageSize: any = 5;
  pageIndex: any = 0;

  teamMapForm: FormGroup = this.formBuilder.group({
    teamId: [''],
  });

  pageSizeOptions: any = [5, 10, 20];
  search_combo_list: any;
  searchForm!: FormGroup;
  qtd: any = [];
  qtm: any = [];
  add = false;
  modify = false;
  view = false;
  delete = false;
  // displayedColumns: any = ["Select","userId","firstName","middleName","lastName","userName"];
  // displayingColumns: any = ["Select","firstName","middleName","lastName","userName"]; 

  displayedColumns: any = ["Select", "firstName"];
  displayingColumns: any = ["Select", "firstName"];
  labels: any = {};
  active_list: any = [];
  leftSelection = new SelectionModel<UseRoleListData>(true, []);
  rightSelection = new SelectionModel<transferData>(true, [])
  subscriptionList: Subscription[] = [];
  @ViewChild(MatPaginator, { read: true }) paginator!: MatPaginator;
  fromDataSource: any = [];
  toDataSource: any = [];
  toTableData: any = [];
  fromTableData: any = [];
  // displayedColumnsAllocated: any = ["AllocatedUser"];
  // dataSourceAvailable: any = [];
  // displayedColumnsAvailable: any = ["AvailableUser"];
  teamList: any = [];

  teamIdVal: any;
  teamDropdownId: any;
  showAvailable: boolean = false;
  sourceFrom: any = [];
  syncPrimaryPaginator(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    if (this.pageSize != event.pageSize) this.pageSize = event.pageSize, this.pageIndex = 0;
    this.load_service();
  }
  @ViewChild(MatSort) sort!: MatSort;
  get searchDatas() {
    return this.searchForm.controls['searchDatas'] as FormArray
  }
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private formBuilder: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private MappingService: MappingService,
    private authService: AuthService,
    private httpClient: HttpClient,
    private componentLoaderService: ComponentLoaderService) {
    this.dataSource = [];
  }

  ngOnInit(): void {


    let url: any = localStorage.getItem('userLn') ? localStorage.getItem('userLn') : "en";
    if (url) this.httpClient.get("assets/api/label-" + url + ".json").subscribe((data: any) => {
      this.labels = data;
      this.active_list = [{ name: this.labels?.active, value: 1 }, { name: this.labels?.inactive, value: 0 }];
    });

    this.load_service();
    this.teamIdDrop();
  }


  moveLeftToRight() {

    this.fromTableData = this.fromDataSource.data;
    this.toTableData = this.toDataSource.data;

    this.leftSelection.selected.forEach((element, index) => {
      this.toTableData.unshift(element); // add right
      this.fromTableData.splice(this.fromTableData.indexOf(this.leftSelection.selected[index]), 1); // remove left
    });
    this.toDataSource.data = this.toTableData;
    this.fromDataSource.data = this.fromTableData;
    console.log(this.toDataSource.data)
    this.leftSelection.clear();


  }
  moveRightToLeft() {

    this.fromTableData = this.fromDataSource.data;
    this.toTableData = this.toDataSource.data;

    this.rightSelection.selected.forEach((element, index) => {
      this.fromTableData.unshift(element); // add left 
      this.toTableData.splice(this.toTableData.indexOf(this.rightSelection.selected[index]), 1); // remove right
    });
    this.fromDataSource.data = this.fromTableData;
    this.toDataSource.data = this.toTableData;
    this.rightSelection.clear();


  }

  //Left Side Table

  masterToggle() {

    this.isAllSelected()
      ? this.leftSelection.clear()
      : this.fromDataSource.data.forEach((row: any) => this.leftSelection.select(row));
  }

  isAllSelected() {

    const numSelected = this.leftSelection.selected.length;
    const numRows = this.fromDataSource.data.length;
    return numSelected === numRows;
  }

  checkboxLabel(row?: any): string {

    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.leftSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.userId + 1}`;
  }

  checkboxLabelRight(row?: any): string {

    if (!row) {
      return `${this.istableSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.rightSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.userId + 1}`;
  }

  //Right Side Table

  istableSelected() {
    const numSelected = this.rightSelection.selected.length;
    const numRows = this.toDataSource.data.length;
    return numSelected === numRows;
  }
  /* Selects all rows if they are not all selected; otherwise clear selection. */
  mastertableToggle() {
    this.istableSelected()
      ? this.rightSelection.clear()
      : this.toDataSource.data.forEach((row: any) => this.rightSelection.select(row));
  }
  checkboxtableLabel(row?: transferData): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.rightSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.userId + 1}`;
  }



  //Drop Down
  teamIdDrop() {
    this.teamIdVal = this.teamMapForm.value.teamId;
    console.log(this.teamIdVal);
    // console.log(data.target.value);
    let data = {};
    let locationDelete = this.MappingService.teamDropdown(this.teamIdVal).subscribe((data: any) => {
      let resp = JSON.parse(data['_body']);
      if (resp.responseCode == '200') {

        this.teamList = resp.succesObject;
      } else {
      }
    }, error => {
      if (error.status === 401) {
        alert("Error");
      }
    });
  }

  teamIdDropChange() {

    // if(this.teamDropdownId == undefined || this.teamDropdownId == "" ||this.teamDropdownId == null){
    //   this.showAvailable = false;

    // }else{
    //   this.showAvailable = true;
    // }

    this.leftSelection.clear();
    this.rightSelection.clear();


    this.teamDropdownId = this.teamMapForm.value.teamId;

    console.log("cccc", this.teamMapForm.value.teamId);

    this.load_service();

  }

  load_service(refresh?: any) {

    this.componentLoaderService.display(true);
    let dragDrop = this.MappingService.getAllDragDrop({ teamId: this.teamDropdownId }).subscribe((data: any) => {

      let response = JSON.parse(data['_body']);
      this.sourceFrom = response?.succesObject?.allocatedUserList;
      this.fromDataSource = new MatTableDataSource(response?.succesObject?.allocatedUserList);
      this.toDataSource = new MatTableDataSource(response?.succesObject?.availableUserList);
      this.componentLoaderService.display(false);

    })

  }

  mapsave: any = [];

  saveForm: any;
  onSave() {

    this.componentLoaderService.display(true);
    this.teamIdVal = this.teamMapForm.value.teamId;

    if (this.teamIdVal == 0) {

      this.componentLoaderService.display(false);
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: false,
        panelClass: 'btnCenter',
        width: 'auto',
        data: {
          title: this.labels?.alert,
          message: "mandatory",
          btnYes: this.labels?.ok,
        }
      });
    } else if (this.teamIdVal) {
      let tableList = {
        "teamId": this.teamIdVal,
        "allocatedUserList": this.fromDataSource.data
      }
      let mapadd = this.MappingService.onSave(tableList).subscribe((data: any) => {
        let Response = JSON.parse(data['_body']);
        if (Response?.responseCode === '200') {
          this.componentLoaderService.display(false);
          const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            disableClose: false,
            panelClass: 'btnCenter',
            width: 'auto',
            data: {
              title: this.labels?.information,
              server: 'servermessage',
              message: Response?.responseMessage,
              btnYes: this.labels?.ok,
            }
          });
          dialogRef.afterClosed().subscribe((data: any) => {
            this.componentLoaderService.display(true);
            this.router.navigate(['/team-user-mapping']);
            this.load_service();
            this.teamMapForm.reset();

          });
        } else {
          this.componentLoaderService.display(false);
          const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            disableClose: false,
            panelClass: 'btnCenter',
            width: 'auto',
            data: {
              title: this.labels?.alert,
              server: 'servermessage',
              message: Response?.responseMessage,
              btnYes: this.labels?.ok,
            }
          });
        }
      }, error => {
        this.componentLoaderService.display(false);
        if (error.status === 401) {
          if (this.authService.refreshToken().subscribe((status: any) => { return status })) {
            this.onSave();
          }
        }
      });
      this.subscriptionList.push(mapadd);
    }
  }

}
