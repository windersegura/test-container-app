import { Injectable } from '@angular/core';

export interface Task {
  id: number;
  title: string;
  done: boolean;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly url = '/api/todos';

  async getTasks(): Promise<Task[]> {
    const res = await fetch(this.url);
    return res.json();
  }

  async addTask(title: string): Promise<Task> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return res.json();
  }

  async setDone(id: number, done: boolean): Promise<Task> {
    const res = await fetch(`${this.url}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    });
    return res.json();
  }
}
