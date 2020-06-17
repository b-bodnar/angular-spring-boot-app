import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {AboutDialogComponent} from "../../dialog/about/about-dialog.component";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
   year: Date;
   site = 'https://javabegin.ru/';
   blog = 'https://www.facebook.com/profile.php?id=100001482732644';
   siteName = 'JavaBegin';

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
    this.year = new Date(); // текуший год
  }

  // окно "О программе"
   openAboutDialog() {
    this.dialog.open(AboutDialogComponent,
      {
        autoFocus: false,
        data: {
          dialogTitle: 'О программе',
          message: 'Данное приложение было создано для видеокурса "Angular для начинающих" на сайте javabegin.ru'
        },
        width: '400px'
      });

  }

}
