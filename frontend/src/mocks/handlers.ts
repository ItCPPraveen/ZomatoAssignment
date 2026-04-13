import { http, HttpResponse, delay } from 'msw';

// In-memory data store for the mock backend
let users = [
  { id: 'user-1', name: 'Test User', email: 'test@example.com', password: 'password123' }
];

let projects = [
  { id: 'proj-1', name: 'Website Redesign', description: 'Q2 project', owner_id: 'user-1', created_at: new Date().toISOString() }
];

let tasks = [
  { id: 'task-1', title: 'Design homepage', description: 'Create Figma mocks', status: 'in_progress', priority: 'high', project_id: 'proj-1', assignee_id: 'user-1', due_date: '2026-04-15', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const BASE_URL = 'http://localhost:4000';

export const handlers = [
  // --- AUTH ---
  http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
    await delay(500);
    const body = await request.json() as any;
    
    if (!body.email || !body.password || !body.name) {
      return HttpResponse.json({ error: 'validation failed', fields: { email: 'is required' } }, { status: 400 });
    }

    if (users.find(u => u.email === body.email)) {
      return HttpResponse.json({ error: 'email already exists' }, { status: 400 });
    }

    const newUser = { id: `user-${Date.now()}`, name: body.name, email: body.email, password: body.password };
    users.push(newUser);

    return HttpResponse.json({
      token: `mock-jwt-token-${newUser.id}`,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    }, { status: 201 });
  }),

  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    await delay(500);
    const body = await request.json() as any;
    const user = users.find(u => u.email === body.email && u.password === body.password);
    
    if (user) {
      return HttpResponse.json({
        token: `mock-jwt-token-${user.id}`,
        user: { id: user.id, name: user.name, email: user.email }
      });
    }
    return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
  }),

  // --- PROJECTS ---
  http.get(`${BASE_URL}/projects`, async () => {
    await delay(500);
    return HttpResponse.json({ projects });
  }),

  http.post(`${BASE_URL}/projects`, async ({ request }) => {
    await delay(500);
    const body = await request.json() as any;
    const newProject = {
      id: `proj-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      owner_id: 'user-1', // Assuming logged in as user-1
      created_at: new Date().toISOString()
    };
    projects.push(newProject);
    return HttpResponse.json(newProject, { status: 201 });
  }),

  http.get(`${BASE_URL}/projects/:id`, async ({ params }) => {
    await delay(500);
    const project = projects.find(p => p.id === params.id);
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    
    const projectTasks = tasks.filter(t => t.project_id === params.id);
    return HttpResponse.json({ ...project, tasks: projectTasks });
  }),

  http.patch(`${BASE_URL}/projects/:id`, async ({ request, params }) => {
    await delay(500);
    const body = await request.json() as any;
    const idx = projects.findIndex(p => p.id === params.id);
    if (idx === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    
    projects[idx] = { ...projects[idx], ...body };
    return HttpResponse.json(projects[idx]);
  }),

  http.delete(`${BASE_URL}/projects/:id`, async ({ params }) => {
    await delay(500);
    projects = projects.filter(p => p.id !== params.id);
    tasks = tasks.filter(t => t.project_id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  // --- TASKS ---
  http.get(`${BASE_URL}/projects/:id/tasks`, async ({ request, params }) => {
    await delay(500);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const assignee = url.searchParams.get('assignee');
    
    let filteredTasks = tasks.filter(t => t.project_id === params.id);
    if (status) filteredTasks = filteredTasks.filter(t => t.status === status);
    if (assignee) filteredTasks = filteredTasks.filter(t => t.assignee_id === assignee);
    
    return HttpResponse.json({ tasks: filteredTasks });
  }),

  http.post(`${BASE_URL}/projects/:id/tasks`, async ({ request, params }) => {
    await delay(500);
    const body = await request.json() as any;
    const newTask = {
      id: `task-${Date.now()}`,
      title: body.title,
      description: body.description || '',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      project_id: params.id as string,
      assignee_id: body.assignee_id || null,
      due_date: body.due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    tasks.push(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.patch(`${BASE_URL}/tasks/:id`, async ({ request, params }) => {
    await delay(500);
    const body = await request.json() as any;
    const idx = tasks.findIndex(t => t.id === params.id);
    if (idx === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    
    tasks[idx] = { ...tasks[idx], ...body, updated_at: new Date().toISOString() };
    return HttpResponse.json(tasks[idx]);
  }),

  http.delete(`${BASE_URL}/tasks/:id`, async ({ params }) => {
    await delay(500);
    tasks = tasks.filter(t => t.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  })
];
