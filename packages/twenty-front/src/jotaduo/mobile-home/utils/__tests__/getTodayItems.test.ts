import { getTodayItems } from '~/jotaduo/mobile-home/utils/getTodayItems';

describe('getTodayItems', () => {
  it('puts what has a time first, in order, and the tasks after', () => {
    const items = getTodayItems({
      appointments: [
        {
          __typename: 'JdAgendamento',
          id: 'a2',
          name: 'Retorno',
          startsAt: '2026-10-01T17:00:00.000Z',
        },
        {
          __typename: 'JdAgendamento',
          id: 'a1',
          name: 'Avaliação',
          startsAt: '2026-10-01T12:30:00.000Z',
        },
      ],
      reminders: [
        {
          __typename: 'JdLembrete',
          id: 'r1',
          name: 'Ligar',
          dispararEm: '2026-10-01T15:00:00.000Z',
        },
      ],
      tasks: [
        {
          __typename: 'Task',
          id: 't1',
          title: 'Enviar contrato',
          dueAt: '2026-10-01T10:00:00.000Z',
          status: 'TODO',
        },
      ],
    });

    expect(items.map((item) => item.id)).toEqual(['a1', 'r1', 'a2', 't1']);
  });

  it('names an appointment by its service when it has no title', () => {
    const [item] = getTodayItems({
      appointments: [
        {
          __typename: 'JdAgendamento',
          id: 'a1',
          name: '',
          service: 'Corte',
          startsAt: '2026-10-01T12:30:00.000Z',
        },
      ],
      reminders: [],
      tasks: [],
    });

    expect(item.title).toBe('Corte');
    expect(item.detail).toBeUndefined();
  });

  it('keeps the service as a detail next to the title', () => {
    const [item] = getTodayItems({
      appointments: [
        {
          __typename: 'JdAgendamento',
          id: 'a1',
          name: 'Sarah',
          service: 'Corte',
          startsAt: '2026-10-01T12:30:00.000Z',
        },
      ],
      reminders: [],
      tasks: [],
    });

    expect(item.detail).toBe('Corte');
  });

  it('tells a task checked off from an open one', () => {
    const items = getTodayItems({
      appointments: [],
      reminders: [],
      tasks: [
        {
          __typename: 'Task',
          id: 'open',
          title: 'Ligar',
          dueAt: '2026-10-01T10:00:00.000Z',
          status: 'TODO',
        },
        {
          __typename: 'Task',
          id: 'done',
          title: 'Enviar',
          dueAt: '2026-10-01T12:00:00.000Z',
          status: 'DONE',
        },
      ],
    });

    expect(items).toEqual([
      expect.objectContaining({ id: 'open', isDone: false }),
      expect.objectContaining({ id: 'done', isDone: true }),
    ]);
  });

  it('links each item to its record', () => {
    const [item] = getTodayItems({
      appointments: [],
      reminders: [
        {
          __typename: 'JdLembrete',
          id: 'r1',
          name: 'Ligar',
          pessoaNome: 'Sarah',
          dispararEm: '2026-10-01T15:00:00.000Z',
        },
      ],
      tasks: [],
    });

    expect(item.link).toBe('/object/jdLembrete/r1');
    expect(item.detail).toBe('Sarah');
  });
});
