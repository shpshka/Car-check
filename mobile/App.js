import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from './src/api';
import { mockDrivers, mockInspections, mockProblems, mockReminders, mockTransports } from './src/mockData';

const tabs = [
  { key: 'dashboard', label: 'Панель' },
  { key: 'transports', label: 'Транспорт' },
  { key: 'drivers', label: 'Водители' },
  { key: 'reminders', label: 'Напоминания' },
];

const statusLabels = {
  OK: 'OK',
  INSPECTION_SOON: 'Скоро осмотр',
  OVERDUE: 'Просрочено',
  HAS_PROBLEMS: 'Есть проблемы',
  OPEN: 'Открыта',
  IN_PROGRESS: 'В работе',
  RESOLVED: 'Решена',
  UPCOMING: 'Скоро',
  PROBLEM: 'Проблема',
};

const statusColors = {
  OK: ['#ddf8ef', '#116149'],
  RESOLVED: ['#ddf8ef', '#116149'],
  INSPECTION_SOON: ['#fff3c6', '#735100'],
  UPCOMING: ['#fff3c6', '#735100'],
  OVERDUE: ['#ffe2e2', '#9f1f1f'],
  OPEN: ['#ffe2e2', '#9f1f1f'],
  HAS_PROBLEMS: ['#ffe8d1', '#7a3c00'],
  IN_PROGRESS: ['#ffe8d1', '#7a3c00'],
  PROBLEM: ['#ffe8d1', '#7a3c00'],
};

const initialState = {
  transports: [],
  drivers: [],
  problems: [],
  reminders: [],
  inspections: [],
};

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState(initialState);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [transports, drivers, problems, reminders] = await Promise.all([
        api.getTransports(),
        api.getDrivers(),
        api.getActiveProblems(),
        api.getReminders(),
      ]);
      setData({ transports, drivers, problems, reminders, inspections: [] });
      setApiOnline(true);
    } catch (error) {
      setData({
        transports: mockTransports,
        drivers: mockDrivers,
        problems: mockProblems,
        reminders: mockReminders,
        inspections: mockInspections,
      });
      setApiOnline(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await loadAll();
  }

  async function openTransport(transport) {
    setSelectedTransport(transport);
    setTab('details');
    if (!apiOnline) {
      return;
    }

    try {
      const inspections = await api.getInspections(transport.id);
      setData((current) => ({ ...current, inspections }));
    } catch {
      setData((current) => ({ ...current, inspections: [] }));
    }
  }

  function driverName(id) {
    return data.drivers.find((driver) => driver.id === id)?.fullName || 'Не назначен';
  }

  function transportLabel(id) {
    const transport = data.transports.find((item) => item.id === id);
    return transport ? `${transport.plateNumber} · ${transport.brand} ${transport.model}` : 'Неизвестный транспорт';
  }

  async function saveTransport(payload) {
    if (!apiOnline) {
      Alert.alert('Нет подключения', 'Запустите backend, чтобы сохранять данные в Supabase.');
      return;
    }
    await api.createTransport(payload);
    setModal(null);
    await loadAll();
  }

  async function saveDriver(payload) {
    if (!apiOnline) {
      Alert.alert('Нет подключения', 'Запустите backend, чтобы сохранять данные в Supabase.');
      return;
    }
    await api.createDriver(payload);
    setModal(null);
    await loadAll();
  }

  async function saveInspection(payload) {
    if (!apiOnline) {
      Alert.alert('Нет подключения', 'Запустите backend, чтобы сохранять данные в Supabase.');
      return;
    }
    await api.createInspection(payload);
    setModal(null);
    await loadAll();
    if (selectedTransport) {
      await openTransport(selectedTransport);
    }
  }

  async function saveProblem(payload) {
    if (!apiOnline) {
      Alert.alert('Нет подключения', 'Запустите backend, чтобы сохранять данные в Supabase.');
      return;
    }
    await api.createProblem(payload);
    setModal(null);
    await loadAll();
  }

  async function resolveProblem(problem) {
    if (!apiOnline) {
      Alert.alert('Нет подключения', 'Запустите backend, чтобы закрывать проблемы в Supabase.');
      return;
    }
    await api.resolveProblem(problem.id);
    await loadAll();
  }

  const dashboard = useMemo(() => {
    const overdue = data.transports.filter((transport) => transport.status === 'OVERDUE');
    const upcoming = data.transports.filter((transport) => transport.status === 'INSPECTION_SOON');
    return {
      total: data.transports.length,
      overdue: overdue.length,
      problems: data.problems.length,
      upcoming: upcoming.length,
      overdueList: overdue,
      upcomingList: upcoming,
    };
  }, [data]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2454d6" />
        <Text style={styles.loadingText}>Загрузка AutoControl...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <Header apiOnline={apiOnline} onRefresh={refresh} />
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentBody}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        >
          {tab === 'dashboard' && (
            <DashboardScreen
              dashboard={dashboard}
              problems={data.problems}
              reminders={data.reminders}
              transportLabel={transportLabel}
              openTransport={openTransport}
            />
          )}
          {tab === 'transports' && (
            <TransportsScreen transports={data.transports} driverName={driverName} openTransport={openTransport} onAdd={() => setModal('transport')} />
          )}
          {tab === 'details' && selectedTransport && (
            <DetailsScreen
              transport={selectedTransport}
              driverName={driverName}
              inspections={data.inspections}
              problems={data.problems.filter((problem) => problem.transportId === selectedTransport.id)}
              onBack={() => setTab('transports')}
              onAddInspection={() => setModal('inspection')}
              onAddProblem={() => setModal('problem')}
              onResolveProblem={resolveProblem}
            />
          )}
          {tab === 'drivers' && <DriversScreen drivers={data.drivers} onAdd={() => setModal('driver')} />}
          {tab === 'reminders' && <RemindersScreen reminders={data.reminders} transportLabel={transportLabel} />}
        </ScrollView>
        <BottomTabs active={tab === 'details' ? 'transports' : tab} setTab={setTab} />
      </View>

      <FormModal title={modalTitle(modal)} visible={Boolean(modal)} onClose={() => setModal(null)}>
        {modal === 'transport' && <TransportForm onSubmit={saveTransport} />}
        {modal === 'driver' && <DriverForm onSubmit={saveDriver} />}
        {modal === 'inspection' && (
          <InspectionForm
            transports={data.transports}
            drivers={data.drivers}
            defaultTransportId={selectedTransport?.id}
            onSubmit={saveInspection}
          />
        )}
        {modal === 'problem' && (
          <ProblemForm transports={data.transports} defaultTransportId={selectedTransport?.id} onSubmit={saveProblem} />
        )}
      </FormModal>
    </SafeAreaView>
  );
}

function Header({ apiOnline, onRefresh }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>AutoControl</Text>
        <Text style={styles.subtitle}>{apiOnline ? 'Подключено к API' : 'Демо-режим без API'}</Text>
      </View>
      <Pressable style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshText}>Обновить</Text>
      </Pressable>
    </View>
  );
}

function DashboardScreen({ dashboard, problems, reminders, transportLabel, openTransport }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Панель</Text>
      <View style={styles.summaryGrid}>
        <SummaryCard label="Всего" value={dashboard.total} />
        <SummaryCard label="Просрочено" value={dashboard.overdue} danger />
        <SummaryCard label="Проблемы" value={dashboard.problems} warning />
        <SummaryCard label="Скоро" value={dashboard.upcoming} info />
      </View>

      <Section title="Срочно">
        {dashboard.overdueList.length ? (
          dashboard.overdueList.map((transport) => (
            <TransportRow key={transport.id} transport={transport} onPress={() => openTransport(transport)} />
          ))
        ) : (
          <EmptyState text="Просроченных осмотров нет." />
        )}
      </Section>

      <Section title="Активные проблемы">
        {problems.length ? problems.map((problem) => <ProblemRow key={problem.id} problem={problem} transportLabel={transportLabel} />) : <EmptyState text="Активных проблем нет." />}
      </Section>

      <Section title="Напоминания">
        {reminders.map((reminder) => (
          <ReminderRow key={reminder.id} reminder={reminder} transportLabel={transportLabel} />
        ))}
      </Section>
    </View>
  );
}

function TransportsScreen({ transports, driverName, openTransport, onAdd }) {
  const [query, setQuery] = useState('');
  const filtered = transports.filter((transport) => transport.plateNumber.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={styles.screen}>
      <ScreenTop title="Транспорт" action="Добавить" onAction={onAdd} />
      <TextInput style={styles.input} placeholder="Поиск по госномеру" value={query} onChangeText={setQuery} />
      {filtered.map((transport) => (
        <TransportCard key={transport.id} transport={transport} driverName={driverName(transport.lastDriverId)} onPress={() => openTransport(transport)} />
      ))}
      {!filtered.length && <EmptyState text="Транспорт не найден." />}
    </View>
  );
}

function DetailsScreen({ transport, driverName, inspections, problems, onBack, onAddInspection, onAddProblem, onResolveProblem }) {
  return (
    <View style={styles.screen}>
      <Pressable onPress={onBack}>
        <Text style={styles.link}>Назад к транспорту</Text>
      </Pressable>
      <View style={styles.detailsHeader}>
        <View>
          <Text style={styles.title}>{transport.plateNumber}</Text>
          <Text style={styles.subtitle}>{transport.brand} {transport.model} · {transport.year}</Text>
        </View>
        <Badge status={transport.status} />
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.primaryButton} onPress={onAddInspection}>
          <Text style={styles.primaryText}>Осмотр</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onAddProblem}>
          <Text style={styles.secondaryText}>Проблема</Text>
        </Pressable>
      </View>

      <InfoGrid items={[
        ['Водитель', driverName(transport.lastDriverId)],
        ['Последний осмотр', formatDate(transport.lastInspectionDate)],
        ['Следующий осмотр', formatDate(transport.nextInspectionDate)],
        ['Комментарий', transport.comment || 'Нет комментария'],
      ]} />

      <Section title="Проблемы">
        {problems.length ? (
          problems.map((problem) => (
            <View key={problem.id} style={styles.card}>
              <ProblemRow problem={problem} />
              <Pressable style={styles.resolveButton} onPress={() => onResolveProblem(problem)}>
                <Text style={styles.resolveText}>Закрыть проблему</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <EmptyState text="Активных проблем нет." />
        )}
      </Section>

      <Section title="История осмотров">
        {inspections.length ? (
          inspections.map((inspection) => (
            <View key={inspection.id} style={styles.historyItem}>
              <Text style={styles.historyDate}>{formatDate(inspection.inspectionDate)}</Text>
              <Text style={styles.historyText}>{inspection.result}</Text>
              <Text style={styles.muted}>{driverName(inspection.driverId)}</Text>
            </View>
          ))
        ) : (
          <EmptyState text="Осмотров пока нет." />
        )}
      </Section>
    </View>
  );
}

function DriversScreen({ drivers, onAdd }) {
  const [query, setQuery] = useState('');
  const filtered = drivers.filter((driver) => `${driver.fullName} ${driver.phone}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={styles.screen}>
      <ScreenTop title="Водители" action="Добавить" onAction={onAdd} />
      <TextInput style={styles.input} placeholder="Поиск по имени или телефону" value={query} onChangeText={setQuery} />
      {filtered.map((driver) => (
        <View key={driver.id} style={styles.card}>
          <Text style={styles.cardTitle}>{driver.fullName}</Text>
          <Text style={styles.cardMeta}>{driver.phone}</Text>
          <Text style={styles.cardText}>{driver.comment || 'Нет комментария'}</Text>
        </View>
      ))}
      {!filtered.length && <EmptyState text="Водители не найдены." />}
    </View>
  );
}

function RemindersScreen({ reminders, transportLabel }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Напоминания</Text>
      {reminders.map((reminder) => (
        <ReminderRow key={reminder.id} reminder={reminder} transportLabel={transportLabel} />
      ))}
      {!reminders.length && <EmptyState text="Напоминаний нет." />}
    </View>
  );
}

function TransportForm({ onSubmit }) {
  const [form, setForm] = useState({ plateNumber: '', brand: '', model: '', year: '', comment: '' });
  return (
    <Form onSubmit={() => onSubmit({ ...form, year: Number(form.year) })}>
      <Field label="Госномер" value={form.plateNumber} onChangeText={(value) => setForm({ ...form, plateNumber: value })} />
      <Field label="Марка" value={form.brand} onChangeText={(value) => setForm({ ...form, brand: value })} />
      <Field label="Модель" value={form.model} onChangeText={(value) => setForm({ ...form, model: value })} />
      <Field label="Год" keyboardType="numeric" value={form.year} onChangeText={(value) => setForm({ ...form, year: value })} />
      <Field label="Комментарий" value={form.comment} onChangeText={(value) => setForm({ ...form, comment: value })} />
    </Form>
  );
}

function DriverForm({ onSubmit }) {
  const [form, setForm] = useState({ fullName: '', phone: '', comment: '' });
  return (
    <Form onSubmit={() => onSubmit(form)}>
      <Field label="ФИО" value={form.fullName} onChangeText={(value) => setForm({ ...form, fullName: value })} />
      <Field label="Телефон" keyboardType="phone-pad" value={form.phone} onChangeText={(value) => setForm({ ...form, phone: value })} />
      <Field label="Комментарий" value={form.comment} onChangeText={(value) => setForm({ ...form, comment: value })} />
    </Form>
  );
}

function InspectionForm({ transports, drivers, defaultTransportId, onSubmit }) {
  const [form, setForm] = useState({
    transportId: defaultTransportId || transports[0]?.id || '',
    driverId: drivers[0]?.id || '',
    inspectionDate: new Date().toISOString().slice(0, 10),
    result: '',
    comment: '',
    nextInspectionPeriodDays: '30',
  });
  return (
    <Form onSubmit={() => onSubmit({ ...form, nextInspectionPeriodDays: Number(form.nextInspectionPeriodDays) })}>
      <PickerField label="Транспорт" value={form.transportId} options={transports.map((item) => [item.id, item.plateNumber])} onChange={(value) => setForm({ ...form, transportId: value })} />
      <PickerField label="Водитель" value={form.driverId} options={drivers.map((item) => [item.id, item.fullName])} onChange={(value) => setForm({ ...form, driverId: value })} />
      <Field label="Дата осмотра" value={form.inspectionDate} onChangeText={(value) => setForm({ ...form, inspectionDate: value })} />
      <Field label="Результат" value={form.result} onChangeText={(value) => setForm({ ...form, result: value })} />
      <Field label="Следующий осмотр через дней" keyboardType="numeric" value={form.nextInspectionPeriodDays} onChangeText={(value) => setForm({ ...form, nextInspectionPeriodDays: value })} />
      <Field label="Комментарий" value={form.comment} onChangeText={(value) => setForm({ ...form, comment: value })} />
    </Form>
  );
}

function ProblemForm({ transports, defaultTransportId, onSubmit }) {
  const [form, setForm] = useState({
    transportId: defaultTransportId || transports[0]?.id || '',
    title: '',
    description: '',
    status: 'OPEN',
  });
  return (
    <Form onSubmit={() => onSubmit(form)}>
      <PickerField label="Транспорт" value={form.transportId} options={transports.map((item) => [item.id, item.plateNumber])} onChange={(value) => setForm({ ...form, transportId: value })} />
      <Field label="Название" value={form.title} onChangeText={(value) => setForm({ ...form, title: value })} />
      <Field label="Описание" value={form.description} onChangeText={(value) => setForm({ ...form, description: value })} />
      <PickerField label="Статус" value={form.status} options={[['OPEN', 'Открыта'], ['IN_PROGRESS', 'В работе'], ['RESOLVED', 'Решена']]} onChange={(value) => setForm({ ...form, status: value })} />
    </Form>
  );
}

function Form({ children, onSubmit }) {
  return (
    <View style={styles.form}>
      {children}
      <Pressable style={styles.primaryButton} onPress={onSubmit}>
        <Text style={styles.primaryText}>Сохранить</Text>
      </Pressable>
    </View>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.input} placeholder={label} {...props} />
    </View>
  );
}

function PickerField({ label, value, options, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map(([optionValue, optionLabel]) => (
          <Pressable key={optionValue} style={[styles.choice, value === optionValue && styles.choiceActive]} onPress={() => onChange(optionValue)}>
            <Text style={[styles.choiceText, value === optionValue && styles.choiceTextActive]}>{optionLabel}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function FormModal({ title, visible, onClose, children }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalPage}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.link}>Закрыть</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.contentBody}>{children}</ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function SummaryCard({ label, value, danger, warning, info }) {
  const accent = danger ? '#d64545' : warning ? '#d9822b' : info ? '#2b7a78' : '#2454d6';
  return (
    <View style={[styles.summaryCard, { borderLeftColor: accent }]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function TransportCard({ transport, driverName, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{transport.plateNumber}</Text>
          <Text style={styles.cardMeta}>{transport.brand} {transport.model} · {transport.year}</Text>
        </View>
        <Badge status={transport.status} />
      </View>
      <Text style={styles.cardText}>Водитель: {driverName}</Text>
      <Text style={styles.cardText}>Следующий осмотр: {formatDate(transport.nextInspectionDate)}</Text>
    </Pressable>
  );
}

function TransportRow({ transport, onPress }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View>
        <Text style={styles.rowTitle}>{transport.plateNumber}</Text>
        <Text style={styles.muted}>{transport.brand} {transport.model}</Text>
      </View>
      <Badge status={transport.status} />
    </Pressable>
  );
}

function ProblemRow({ problem, transportLabel }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{problem.title}</Text>
        {transportLabel && <Text style={styles.muted}>{transportLabel(problem.transportId)}</Text>}
        <Text style={styles.cardText}>{problem.description}</Text>
      </View>
      <Badge status={problem.status} />
    </View>
  );
}

function ReminderRow({ reminder, transportLabel }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.rowMain}>
          <Text style={styles.cardTitle}>{reminder.title}</Text>
          <Text style={styles.cardMeta}>{transportLabel(reminder.transportId)}</Text>
        </View>
        <Badge status={reminder.type} />
      </View>
      <Text style={styles.cardText}>Дата: {formatDate(reminder.dueDate)}</Text>
    </View>
  );
}

function Badge({ status }) {
  const [backgroundColor, color] = statusColors[status] || ['#eef3ff', '#2454d6'];
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color }]}>{statusLabels[status] || status}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ScreenTop({ title, action, onAction }) {
  return (
    <View style={styles.screenTop}>
      <Text style={styles.title}>{title}</Text>
      <Pressable style={styles.primaryButtonSmall} onPress={onAction}>
        <Text style={styles.primaryText}>{action}</Text>
      </Pressable>
    </View>
  );
}

function EmptyState({ text }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function InfoGrid({ items }) {
  return (
    <View style={styles.infoGrid}>
      {items.map(([label, value]) => (
        <View key={label} style={styles.infoItem}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function BottomTabs({ active, setTab }) {
  return (
    <View style={styles.tabs}>
      {tabs.map((item) => (
        <Pressable key={item.key} style={[styles.tab, active === item.key && styles.tabActive]} onPress={() => setTab(item.key)}>
          <Text style={[styles.tabText, active === item.key && styles.tabTextActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function modalTitle(modal) {
  if (modal === 'transport') return 'Добавить транспорт';
  if (modal === 'driver') return 'Добавить водителя';
  if (modal === 'inspection') return 'Добавить осмотр';
  if (modal === 'problem') return 'Добавить проблему';
  return '';
}

function formatDate(value) {
  if (!value) return 'Нет данных';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ru-RU').format(date);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  app: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f7fb',
  },
  loadingText: {
    marginTop: 12,
    color: '#596477',
    fontWeight: '700',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 34 : 10,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dde4ef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 24,
    fontWeight: '900',
    color: '#18202f',
  },
  subtitle: {
    color: '#697386',
    fontWeight: '700',
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: '#eef3ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  refreshText: {
    color: '#2454d6',
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
  contentBody: {
    padding: 16,
    paddingBottom: 28,
  },
  screen: {
    gap: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#18202f',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: '#dde4ef',
  },
  summaryLabel: {
    color: '#697386',
    fontWeight: '800',
  },
  summaryValue: {
    fontSize: 30,
    fontWeight: '900',
    marginTop: 6,
    color: '#18202f',
  },
  section: {
    gap: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#18202f',
  },
  screenTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dde4ef',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#18202f',
  },
  cardMeta: {
    color: '#697386',
    fontWeight: '700',
    marginTop: 2,
  },
  cardText: {
    color: '#445066',
    fontWeight: '600',
  },
  row: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dde4ef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowMain: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#18202f',
  },
  muted: {
    color: '#697386',
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#cfd8e7',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    color: '#18202f',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#2454d6',
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  primaryButtonSmall: {
    backgroundColor: '#2454d6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cfd8e7',
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'center',
    flex: 1,
  },
  secondaryText: {
    color: '#1f3260',
    fontWeight: '900',
  },
  link: {
    color: '#2454d6',
    fontWeight: '900',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  infoGrid: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dde4ef',
    padding: 14,
    gap: 12,
  },
  infoItem: {
    gap: 2,
  },
  infoLabel: {
    color: '#697386',
    fontWeight: '800',
  },
  infoValue: {
    color: '#18202f',
    fontWeight: '900',
  },
  historyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dde4ef',
    padding: 14,
    gap: 4,
  },
  historyDate: {
    color: '#18202f',
    fontWeight: '900',
  },
  historyText: {
    color: '#445066',
    fontWeight: '700',
  },
  resolveButton: {
    backgroundColor: '#ddf8ef',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resolveText: {
    color: '#116149',
    fontWeight: '900',
  },
  empty: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cfd8e7',
    padding: 18,
  },
  emptyText: {
    color: '#697386',
    fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#dde4ef',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#e9efff',
  },
  tabText: {
    color: '#596477',
    fontWeight: '900',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#143b94',
  },
  modalPage: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  modalHeader: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dde4ef',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 34 : 10,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#18202f',
    fontSize: 22,
    fontWeight: '900',
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 7,
  },
  fieldLabel: {
    color: '#344054',
    fontWeight: '900',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choice: {
    borderWidth: 1,
    borderColor: '#cfd8e7',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  choiceActive: {
    backgroundColor: '#2454d6',
    borderColor: '#2454d6',
  },
  choiceText: {
    color: '#39455c',
    fontWeight: '800',
  },
  choiceTextActive: {
    color: '#ffffff',
  },
});
