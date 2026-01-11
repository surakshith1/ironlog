export interface Program {
    id: string;
    name: string;
    schedule: string;
    focus: string;
    lastEdited: string;
    isLegacy?: boolean;
}

export const PROGRAMS: Program[] = [
    {
        id: '1',
        name: 'Push-Pull-Legs',
        schedule: '6 Days/Week',
        focus: 'Hypertrophy Focus',
        lastEdited: 'Today',
    },
    {
        id: '2',
        name: 'Upper / Lower Split',
        schedule: '4 Days/Week',
        focus: 'Strength Focus',
        lastEdited: 'Yesterday',
    },
    {
        id: '3',
        name: 'StrongLifts 5x5',
        schedule: '3 Days/Week',
        focus: 'Beginner',
        lastEdited: 'Last Week',
    },
    {
        id: '4',
        name: 'Arnold Split',
        schedule: '6 Days/Week',
        focus: 'Volume',
        lastEdited: 'Last Month',
        isLegacy: true,
    },
];
