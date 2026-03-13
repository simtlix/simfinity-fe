import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { CountrySelector } from './CountrySelector';

const meta = {
  title: 'Custom/CountrySelector',
  component: CountrySelector,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof CountrySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    disabled: false,
  },
};

export const PreSelected: Story = {
  args: {
    value: 'AR',
    disabled: false,
  },
};

export const WithError: Story = {
  args: {
    value: '',
    disabled: false,
    error: 'Country is required',
  },
};

export const Disabled: Story = {
  args: {
    value: 'US',
    disabled: true,
  },
};
