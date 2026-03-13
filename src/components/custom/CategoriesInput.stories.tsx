import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { CategoriesInput } from './CategoriesInput';

const meta = {
  title: 'Custom/CategoriesInput',
  component: CategoriesInput,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof CategoriesInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    value: [],
    disabled: false,
  },
};

export const WithCategories: Story = {
  args: {
    value: ['Drama', 'Thriller', 'Sci-Fi'],
    disabled: false,
  },
};

export const WithError: Story = {
  args: {
    value: [],
    disabled: false,
    error: 'At least one category is required',
  },
};

export const Disabled: Story = {
  args: {
    value: ['Drama', 'Comedy'],
    disabled: true,
  },
};
