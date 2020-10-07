import {Component, OnInit} from '@angular/core';
import {Category} from './model/Category';
import {Task} from './model/Task';
import {IntroService} from './service/intro.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import {Priority} from './model/Priority';
import {MatDialog} from '@angular/material/dialog';
import {PageEvent} from '@angular/material/paginator';
import {CategorySearchValues, TaskSearchValues} from "./data/dao/search/SearchObjects";
import {Stat} from "./model/Stat";
import {DashboardData} from "./object/DashboardData";
import {TaskService} from "./data/dao/impl/TaskService";
import {CategoryService} from "./data/dao/impl/CategoryService";
import {PriorityService} from "./data/dao/impl/PriorityService";
import {StatService} from "./data/dao/impl/StatService";
import {Observable} from "rxjs";
import {CookiesUtils} from "./utils/CookiesUtils";
import {SpinnerService} from "./service/spinner.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  selectedCategory: Category = null;
  isMobile: boolean;
  isTablet: boolean;
  showStat = true;
  showSearch = true;
  tasks: Task[];
  priorities: Priority[];
  categories: Category[];
  stat: Stat;
  dash: DashboardData = new DashboardData();
  menuOpened: boolean;
  menuMode: string;
  menuPosition: string;
  showBackdrop: boolean;
  readonly defaultPageSize = 5;
  readonly defaultPageNumber = 0;
  uncompletedCountForCategoryAll: number;
  totalTasksFounded: number;
  taskSearchValues: TaskSearchValues;
  categorySearchValues = new CategorySearchValues();
  cookiesUtils = new CookiesUtils();
  spinner: SpinnerService;
  readonly cookieTaskSeachValues = 'todo:searchValues';
  readonly cookieShowStat = 'todo:showStat';
  readonly cookieShowSearch = 'todo:showSearch';

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private priorityService: PriorityService,
    private statService: StatService,
    private dialog: MatDialog,
    private introService: IntroService,
    private deviceService: DeviceDetectorService,
    private spinnerService: SpinnerService
  ) {
    this.spinner = spinnerService;
    this.statService.getOverallStat().subscribe((result => {
      this.stat = result;
      this.uncompletedCountForCategoryAll = this.stat.uncompletedTotal;
      this.fillAllCategories().subscribe(res => {
        this.categories = res;
        if (!this.initSearchCookie()) {
          this.taskSearchValues = new TaskSearchValues();
          this.taskSearchValues.pageSize = this.defaultPageSize;
          this.taskSearchValues.pageNumber = this.defaultPageNumber;
        }
        if (this.isMobile) {
          this.showStat = false;
        } else {
          this.initShowStatCookie();
        }
        this.initShowSearchCookie();
        this.selectCategory(this.selectedCategory);
      });
    }));
    this.isMobile = deviceService.isMobile();
    this.isTablet = deviceService.isTablet();
    this.setMenuDisplayParams();
  }

  ngOnInit(): void {
    this.fillAllPriorities();
    if (!this.isMobile && !this.isTablet) {
    }
  }

  initShowSearchCookie() {
    const val = this.cookiesUtils.getCookie(this.cookieShowSearch);
    if (val) {
      this.showSearch = (val === 'true');
    }
  }

  initShowStatCookie() {
    if (!this.isMobile) { // если моб. устройство, то не показывать статистику
      const val = this.cookiesUtils.getCookie(this.cookieShowStat);
      if (val) { // если кук найден
        this.showStat = (val === 'true'); // конвертация из string в boolean
      }
    }
  }

  fillAllPriorities() {
    this.priorityService.findAll().subscribe(result => {
      this.priorities = result;
    });
  }

  fillAllCategories(): Observable<Category[]> {
    return this.categoryService.findAll();
  }

  fillDashData(completedCount: number, uncompletedCount: number) {
    this.dash.completedTotal = completedCount;
    this.dash.uncompletedTotal = uncompletedCount;
  }

  selectCategory(category: Category) {
    if (category) {
      this.fillDashData(category.completedCount, category.uncompletedCount);
    } else {
      this.fillDashData(this.stat.completedTotal, this.stat.uncompletedTotal);
    }
    this.taskSearchValues.pageNumber = 0;
    this.selectedCategory = category;
    this.taskSearchValues.categoryId = category ? category.id : null;
    this.searchTasks(this.taskSearchValues);
    if (this.isMobile) {
      this.menuOpened = false;
    }
  }

  addCategory(category: Category) {
    this.categoryService.add(category).subscribe(result => {
        this.searchCategory(this.categorySearchValues);
      }
    );
  }

  deleteCategory(category: Category) {
    this.categoryService.delete(category.id).subscribe(cat => {
      this.selectedCategory = null;
      this.searchCategory(this.categorySearchValues);
      this.selectCategory(this.selectedCategory);
    });
  }

  updateCategory(category: Category) {
    this.categoryService.update(category).subscribe(() => {
      this.searchCategory(this.categorySearchValues);
      this.searchTasks(this.taskSearchValues);
    });
  }

  searchCategory(categorySearchValues: CategorySearchValues) {
    this.categoryService.findCategories(categorySearchValues).subscribe(result => {
      this.categories = result;
    });
  }

  toggleStat(showStat: boolean) {
    this.showStat = showStat;
    this.cookiesUtils.setCookie(this.cookieShowStat, String(showStat));
  }

  toggleSearch(showSearch: boolean) {
    this.showSearch = showSearch;
    this.cookiesUtils.setCookie(this.cookieShowSearch, String(showSearch));
  }

  searchTasks(searchTaskValues: TaskSearchValues) {
    this.taskSearchValues = searchTaskValues;
    this.cookiesUtils.setCookie(this.cookieTaskSeachValues, JSON.stringify(this.taskSearchValues));
    this.taskService.findTasks(this.taskSearchValues).subscribe(result => {
      if (result.totalPages > 0 && this.taskSearchValues.pageNumber >= result.totalPages) {
        this.taskSearchValues.pageNumber = 0;
        this.searchTasks(this.taskSearchValues);
      }
      this.totalTasksFounded = result.totalElements;
      this.tasks = result.content;
    });
  }

  updateOverallCounter() {
    this.statService.getOverallStat().subscribe((res => {
      this.stat = res;
      this.uncompletedCountForCategoryAll = this.stat.uncompletedTotal;
      if (!this.selectedCategory) {
        this.fillDashData(this.stat.completedTotal, this.stat.uncompletedTotal);
      }
    }));
  }

  updateCategoryCounter(category: Category) {
    this.categoryService.findById(category.id).subscribe(cat => {
      this.categories[this.getCategoryIndex(category)] = cat;
      this.showCategoryDashboard(cat);
    });
  }

  showCategoryDashboard(cat: Category) {
    if (this.selectedCategory && this.selectedCategory.id === cat.id) {
      this.fillDashData(cat.completedCount, cat.uncompletedCount);
    }
  }

  addTask(task: Task) {
    this.taskService.add(task).subscribe(result => {
      if (task.category) {
        this.updateCategoryCounter(task.category);
      }
      this.updateOverallCounter();
      this.searchTasks(this.taskSearchValues);
    });
  }

  deleteTask(task: Task) {
    this.taskService.delete(task.id).subscribe(result => {
      if (task.category) {
        this.updateCategoryCounter(task.category);
      }
      this.updateOverallCounter();
      this.searchTasks(this.taskSearchValues);
    });
  }

  updateTask(task: Task) {
    this.taskService.update(task).subscribe(result => {
      if (task.oldCategory) {
        this.updateCategoryCounter(task.oldCategory);
      }
      if (task.category) {
        this.updateCategoryCounter(task.category);
      }
      this.updateOverallCounter();
      this.searchTasks(this.taskSearchValues);
    });
  }

  toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }

  onClosedMenu() {
    this.menuOpened = false;
  }

  setMenuDisplayParams() {
    this.menuPosition = 'left';
    if (this.isMobile) {
      this.menuOpened = false;
      this.menuMode = 'over';
      this.showBackdrop = true;
    } else {
      this.menuOpened = true;
      this.menuMode = 'push';
      this.showBackdrop = false;
    }
  }

  paging(pageEvent: PageEvent) {
    if (this.taskSearchValues.pageSize !== pageEvent.pageSize) {
      this.taskSearchValues.pageNumber = 0;
    } else {
      this.taskSearchValues.pageNumber = pageEvent.pageIndex;
    }
    this.taskSearchValues.pageSize = pageEvent.pageSize;
    this.taskSearchValues.pageNumber = pageEvent.pageIndex;
    this.searchTasks(this.taskSearchValues);
  }

  settingsChanged(priorities: Priority[]) {
    this.priorities = priorities;
    this.searchTasks(this.taskSearchValues);
  }

  initSearchCookie(): boolean {
    const cookie = this.cookiesUtils.getCookie(this.cookieTaskSeachValues);
    if (!cookie) {
      return false;
    }
    const cookieJSON = JSON.parse(cookie);
    if (!cookieJSON) {
      return false;
    }
    if (!this.taskSearchValues) {
      this.taskSearchValues = new TaskSearchValues();
    }
    const tmpPageSize = cookieJSON.pageSize;
    if (tmpPageSize) {
      this.taskSearchValues.pageSize = Number(tmpPageSize);
    }
    const tmpCategoryId = cookieJSON.categoryId;
    if (tmpCategoryId) {
      this.taskSearchValues.categoryId = Number(tmpCategoryId);
      this.selectedCategory = this.getCategoryFromArray(tmpCategoryId);
    }
    const tmpPriorityId = cookieJSON.priorityId;
    if (tmpPriorityId) {
      this.taskSearchValues.priorityId = Number(tmpPriorityId);
    }
    const tmpTitle = cookieJSON.title;
    if (tmpTitle) {
      this.taskSearchValues.title = tmpTitle;
    }
    const tmpCompleted = cookieJSON.completed;
    if (tmpCompleted) {
      this.taskSearchValues.completed = tmpCompleted;
    }
    const tmpSortColumn = cookieJSON.sortColumn;
    if (tmpSortColumn) {
      this.taskSearchValues.sortColumn = tmpSortColumn;
    }
    const tmpSortDirection = cookieJSON.sortDirection;
    if (tmpSortDirection) {
      this.taskSearchValues.sortDirection = tmpSortDirection;
    }
    return true;
  }

  getCategoryFromArray(id: number): Category {
    const tmpCategory = this.categories.find(t => t.id === id);
    return tmpCategory;
  }

  getCategoryIndex(category: Category): number {
    const tmpCategory = this.categories.find(t => t.id === category.id);
    return this.categories.indexOf(tmpCategory);
  }

  getCategoryIndexById(id: number): number {
    const tmpCategory = this.categories.find(t => t.id === id);
    return this.categories.indexOf(tmpCategory);
  }
}


