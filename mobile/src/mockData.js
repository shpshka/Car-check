export const mockDrivers = [
  { id: '1', fullName: 'Азиз Каримов', phone: '+998 90 123 45 67', comment: 'Опытный водитель' },
  { id: '2', fullName: 'Дилшод Юнусов', phone: '+998 93 555 21 10', comment: 'Утренние маршруты' },
  { id: '3', fullName: 'Мадина Собирова', phone: '+998 97 330 44 55', comment: 'Допуск к грузовым авто' },
];

export const mockTransports = [
  {
    id: '1',
    plateNumber: '01A123BC',
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    year: 2020,
    comment: 'Используется для городских доставок.',
    lastDriverId: '1',
    lastInspectionDate: '2026-04-10',
    nextInspectionDate: '2026-05-15',
    status: 'OVERDUE',
  },
  {
    id: '2',
    plateNumber: '01B777AA',
    brand: 'Hyundai',
    model: 'County',
    year: 2019,
    comment: 'Пассажирский транспорт.',
    lastDriverId: '2',
    lastInspectionDate: '2026-05-01',
    nextInspectionDate: '2026-05-29',
    status: 'INSPECTION_SOON',
  },
  {
    id: '3',
    plateNumber: '01C456DD',
    brand: 'Isuzu',
    model: 'NPR',
    year: 2021,
    comment: 'Грузовой автомобиль.',
    lastDriverId: '3',
    lastInspectionDate: '2026-05-12',
    nextInspectionDate: '2026-06-11',
    status: 'HAS_PROBLEMS',
  },
];

export const mockProblems = [
  {
    id: '1',
    transportId: '3',
    title: 'Шум тормозов',
    description: 'Водитель сообщил о скрежете при торможении.',
    status: 'OPEN',
  },
  {
    id: '2',
    transportId: '1',
    title: 'Износ шин',
    description: 'Передние шины близки к минимальной глубине протектора.',
    status: 'IN_PROGRESS',
  },
];

export const mockReminders = [
  { id: '1', transportId: '1', title: 'Осмотр просрочен', dueDate: '2026-05-15', type: 'OVERDUE' },
  { id: '2', transportId: '2', title: 'Скоро осмотр', dueDate: '2026-05-29', type: 'UPCOMING' },
  { id: '3', transportId: '3', title: 'Контроль проблемы', dueDate: '2026-05-24', type: 'PROBLEM' },
];

export const mockInspections = [
  {
    id: '1',
    transportId: '1',
    driverId: '1',
    inspectionDate: '2026-04-10',
    result: 'Пройдено, есть замечание по износу шин',
    comment: 'Запланировать замену шин.',
    nextInspectionPeriodDays: 35,
  },
];
