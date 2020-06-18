import {Injectable} from '@angular/core';
import {Category} from "../model/Category";
import {TestData} from "../data/TestData";
import {Task} from "../model/Task";
import {BehaviorSubject, Observable} from "rxjs";
import {TaskDAOArray} from "../data/dao/impl/TaskDAOArray";
import {CategoryDAOArray} from "../data/dao/impl/CategoryDAOArray";
import {Priority} from "../model/Priority";
import {PriorityDAOArray} from "../data/dao/impl/PriorityDAOArray";

@Injectable({
  providedIn: 'root'
})
export class DataHandlerService {
  // релизации работы с данными с помощью массива
  // (можно подставлять любые релизации, в том числе с БД. Главное - соблюдать интерфейсы)
   taskDaoArray = new TaskDAOArray();
   categoryDaoArray = new CategoryDAOArray();
   priorityDaoArray = new PriorityDAOArray();



  constructor() {
  }


  // задачи

  getAllTasks(): Observable<Task[]> {
    return this.taskDaoArray.getAll();
  }

  addTask(task: Task): Observable<Task> {
    return this.taskDaoArray.add(task);
  }

  deleteTask(id: number): Observable<Task> {
    return this.taskDaoArray.delete(id);
  }

  updateTask(task: Task): Observable<Task> {
    return this.taskDaoArray.update(task);
  }

  // поиск задач по любым параметрам
  searchTasks(category: Category, searchText: string, status: boolean, priority: Priority): Observable<Task[]> {
    return this.taskDaoArray.search(category, searchText, status, priority);
  }


  // статистика

  getCompletedCountInCategory(category: Category): Observable<number> {
    return this.taskDaoArray.getCompletedCountInCategory(category);
  }

  getUncompletedTotalCount(): Observable<number> {
    return this.taskDaoArray.getUncompletedCountInCategory(null);
  }

  getUncompletedCountInCategory(category: Category): Observable<number> {
    return this.taskDaoArray.getUncompletedCountInCategory(category);
  }

  getTotalCountInCategory(category: Category): Observable<number> {
    return this.taskDaoArray.getTotalCountInCategory(category);
  }

  getTotalCount(): Observable<number> {
    return this.taskDaoArray.getTotalCount();
  }


  // категории

  addCategory(title: string): Observable<Category> {
    return this.categoryDaoArray.add(new Category(null, title));
  }

  getAllCategories(): Observable<Category[]> {
    return this.categoryDaoArray.getAll();
  }

  searchCategories(title: string): Observable<Category[]> {
    return this.categoryDaoArray.search(title);
  }

  updateCategory(category: Category): Observable<Category> {
    return this.categoryDaoArray.update(category);
  }

  deleteCategory(id: number): Observable<Category> {
    return this.categoryDaoArray.delete(id);
  }


  // приоритеты

  getAllPriorities(): Observable<Priority[]> {
    return this.priorityDaoArray.getAll();
  }

  addPriority(priority: Priority): Observable<Priority> {
    // @ts-ignore
    return this.priorityDaoArray.add(priority);
  }

  deletePriority(id: number): Observable<Priority> {
    return this.priorityDaoArray.delete(id);
  }

  updatePriority(priority: Priority): Observable<Priority> {
    return this.priorityDaoArray.update(priority);
  }

}
