import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DateColumn } from './DateColumn';

const meta = {
  title: 'Custom/DateColumn',
  component: DateColumn,
  tags: ['autodocs'],
} satisfies Meta<typeof DateColumn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ValidDate: Story = {
  args: {
    value: '2024-06-15',
  },
};

export const TimestampNumber: Story = {
  args: {
    value: 1718409600000,
  },
};

export const InvalidDate: Story = {
  args: {
    value: 'not-a-date',
  },
};

export const NullValue: Story = {
  args: {
    value: null,
  },
};
