import {TaskDAO} from "../interface/TaskDAO";
import {Task} from 'src/app/model/Task';
import {Observable, of} from "rxjs";
import {Category} from "../../../model/Category";
import {Priority} from "../../../model/Priority";
import {TestData} from "../../TestData";

export class TaskDAOArray implements TaskDAO {
  add(): Observable<Task> {
    return undefined;
  }

  delete(id: number): Observable<Task> {
    return of(TestData.tasks.find(todo => todo.id === id));
  }

  get(id: number): Observable<Task> {
    return undefined;
  }

  getAll(): Observable<Task[]> {
    return of(TestData.tasks);
  }

  getCompletedCountInCategory(category: Category): Observable<number> {
    return undefined;
  }

  getTotalCount(): Observable<number> {
    return undefined;
  }

  getTotalCountInCategory(category: Category): Observable<number> {
    return undefined;
  }

  getUncompletedCountInCategory(category: Category): Observable<number> {
    return undefined;
  }

  search(category: Category, searchText: string, status: boolean, priority: Priority): Observable<Task[]> {
    return of(this.searchTodos(category, searchText, status, priority));
  }

  update(T): Observable<Task> {
    return undefined;
  }

  private searchTodos(category: Category, searchText: string, status: boolean, priority: Priority): Task[] {
    let allTasks = TestData.tasks;
    return category != null
      ? allTasks.filter(todo => todo.category === category)
      : allTasks;
  }
}
