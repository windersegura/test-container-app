import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task, TaskService } from './task.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly tasks = signal<Task[]>([]);
  protected newTitle = '';

  constructor(private readonly taskService: TaskService) {
    this.taskService.getTasks().then((tasks) => this.tasks.set(tasks));
  }

  protected async addTask() {
    const title = this.newTitle.trim();
    if (!title) return;
    const task = await this.taskService.addTask(title);
    this.tasks.update((tasks) => [...tasks, task]);
    this.newTitle = '';
  }

  protected async toggleTask(task: Task) {
    const updated = await this.taskService.setDone(task.id, !task.done);
    this.tasks.update((tasks) => tasks.map((t) => (t.id === updated.id ? updated : t)));
  }
}
