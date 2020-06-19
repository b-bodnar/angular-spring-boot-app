import { Injectable } from '@angular/core';
import * as introJs from"intro.js";

@Injectable({
  providedIn: 'root'
})
export class IntroService {

  // для сохранения в localStorage (хранилище браузера, нежелательно там хранить чувствительные данные)
   static INTRO_VIEWED_KEY = 'intro-viewed'; // ключ
   static INTRO_VIEWED_VALUE = 'done'; // значение


   introJS = introJs(); // объект по работе с intro

  constructor() {
  }

  // показать интро (справку) с подсветкой элементов
  public startIntroJS(checkViewed: boolean) {

    // если ранее пользователь уже посмотрел интро - больше не показывать
    if (checkViewed === true && localStorage.getItem(IntroService.INTRO_VIEWED_KEY) === IntroService.INTRO_VIEWED_VALUE) {
      return;
    }

    this.introJS.setOptions(
      {
        nextLabel: 'next >',
        prevLabel: '< prev',
        doneLabel: 'exit',
        skipLabel: 'skip',
        exitOnEsc: true,
        exitOnOverlayClick: false
      });

    this.introJS.start();

    // при закрытии - записываем информацию об этом, чтобы в след. раз не открывать intro еще раз
    this.introJS.onexit(_ => localStorage.setItem(IntroService.INTRO_VIEWED_KEY, IntroService.INTRO_VIEWED_VALUE));

  }

}
