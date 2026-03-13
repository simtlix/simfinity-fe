import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SeasonColumn } from './SeasonColumn';

const meta = {
  title: 'Custom/SeasonColumn',
  component: SeasonColumn,
  tags: ['autodocs'],
} satisfies Meta<typeof SeasonColumn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NumericValue: Story = {
  args: {
    value: 3,
  },
};

export const StringValue: Story = {
  args: {
    value: '1',
  },
};

export const NullValue: Story = {
  args: {
    value: null,
  },
};
