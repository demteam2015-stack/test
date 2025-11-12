// This file contains static data to be used in the application
// since we are not using a live database.

// --- USER DATA ---
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'athlete' | 'coach' | 'parent' | 'admin';
  firstName: string;
  lastName: string;
  photoURL?: string;
  dateOfBirth?: string; // ISO string
}

// This is now a default/template user, not the logged in user.
export const userProfileData: UserProfile = {
  id: 'static-user-01',
  username: 'athlete_user',
  email: 'athlete@example.com',
  role: 'athlete',
  firstName: 'Алексей',
  lastName: 'Демьяненко',
  photoURL: 'https://i.pravatar.cc/150?u=static-user-01',
};


// --- EVENTS DATA ---
export interface TeamEvent {
  id: string;
  title: string;
  status: 'Scheduled' | 'Completed';
  date: string; // ISO string
  location: string;
  type: 'тренировка' | 'собрание';
}

export const eventsData: TeamEvent[] = [
    { id: 'evt1', title: 'Утренняя тренировка', status: 'Scheduled', date: new Date().toISOString(), location: 'Стадион "Олимпийский"', type: 'тренировка'},
    { id: 'evt2', title: 'Командное собрание', status: 'Scheduled', date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), location: 'Конференц-зал', type: 'собрание'},
    { id: 'evt3', title: 'Вечерняя тренировка', status: 'Scheduled', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), location: 'Легкоатлетический манеж', type: 'тренировка'},
    { id: 'evt4', title: 'Тренировка по общей физической подготовке', status: 'Completed', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), location: 'Тренажерный зал', type: 'тренировка'},
];

export const recentActivityData: TeamEvent[] = [
    ...eventsData,
    { id: 'evt5', title: 'Анализ соревнований', status: 'Completed', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), location: 'Онлайн', type: 'собрание'},
    { id: 'evt6', title: 'Силовая тренировка', status: 'Completed', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), location: 'Тренажерный зал', type: 'тренировка'},
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


// --- COMPETITIONS DATA ---
export interface Competition {
  id: string;
  name: string;
  date: string; // ISO string
  location: string;
  status: 'Предстоящий' | 'Завершенный';
  result?: string;
  registrationStatus?: 'Зарегистрирован' | 'Не зарегистрирован' | 'В ожидании';
}

export const competitionsData: Competition[] = [
    { id: 'comp1', name: 'Чемпионат города', date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), location: 'Городской стадион', status: 'Предстоящий', registrationStatus: 'Зарегистрирован'},
    { id: 'comp2', name: 'Национальный отбор', date: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(), location: 'Национальный спортивный комплекс', status: 'Предстоящий', registrationStatus: 'Не зарегистрирован'},
    { id: 'comp3', name: 'Кубок ветеранов', date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), location: 'Стадион "Ветеран"', status: 'Завершенный', result: '1-е место'},
];

// --- TEAM MEMBERS DATA ---
export interface Athlete {
    id: string;
    lastName: string;
    firstName: string;
    middleName: string;
    dateOfBirth: string; // ISO string
    photoURL: string;
}

export const teamMembersData: Athlete[] = [
    { id: 'athlete-1', lastName: 'Демьяненко', firstName: 'Олена', middleName: 'Викторовна', dateOfBirth: '1985-05-15', photoURL: 'https://i.pravatar.cc/150?u=athlete-1' },
    { id: 'athlete-2', lastName: 'Шевченко', firstName: 'Андрей', middleName: 'Николаевич', dateOfBirth: '1976-09-29', photoURL: 'https://i.pravatar.cc/150?u=athlete-2' },
    { id: 'athlete-3', lastName: 'Клочкова', firstName: 'Яна', middleName: 'Александровна', dateOfBirth: '1982-08-07', photoURL: 'https://i.pravatar.cc/150?u=athlete-3' },
    { id: 'athlete-4', lastName: 'Ломаченко', firstName: 'Василий', middleName: 'Анатольевич', dateOfBirth: '1988-02-17', photoURL: 'https://i.pravatar.cc/150?u=athlete-4' },
    { id: 'athlete-5', lastName: 'Бубка', firstName: 'Сергей', middleName: 'Назарович', dateOfBirth: '1963-12-04', photoURL: 'https://i.pravatar.cc/150?u=athlete-5' },
    { id: 'athlete-6', lastName: 'Свитолина', firstName: 'Элина', middleName: 'Михайловна', dateOfBirth: '1994-09-12', photoURL: 'https://i.pravatar.cc/150?u=athlete-6' },
];


// --- PAYMENTS & PLANS DATA ---
export interface Plan {
    id: string;
    title: string;
    price: string;
    description: string;
    features: string[];
    isCurrent: boolean;
    isPopular?: boolean;
}

export interface Payment {
    id: string;
    invoice: string;
    date: string; // ISO string
    amount: string;
    status: "Оплачено" | "В ожидании" | "Не удалось";
}


export const plansData: Plan[] = [
    { id: 'plan1', title: 'Базовый', price: '₴500', description: 'Доступ к групповым тренировкам.', features: ['2 тренировки в неделю', 'Доступ к раздевалке'], isCurrent: false},
    { id: 'plan2', title: 'Стандарт', price: '₴1000', description: 'Оптимальный план для регулярных занятий.', features: ['4 тренировки в неделю', 'Доступ к раздевалке', 'План питания'], isCurrent: true, isPopular: true},
    { id: 'plan3', title: 'Про', price: '₴1500', description: 'Все включено для максимального результата.', features: ['Неограниченные тренировки', 'Персональный шкафчик', 'Индивидуальный план', 'Спортивный массаж'], isCurrent: false},
];


export const paymentHistoryData: Payment[] = [
    { id: 'pay1', invoice: 'INV-001', date: new Date(new Date().setMonth(new Date().getMonth() -1)).toISOString(), amount: '₴1000', status: 'Оплачено'},
    { id: 'pay2', invoice: 'INV-002', date: new Date(new Date().setMonth(new Date().getMonth() -2)).toISOString(), amount: '₴1000', status: 'Оплачено'},
    { id: 'pay3', invoice: 'INV-003', date: new Date(new Date().setMonth(new Date().getMonth() -3)).toISOString(), amount: '₴500', status: 'Оплачено'},
];
