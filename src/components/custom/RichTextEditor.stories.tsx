import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { RichTextEditor } from './RichTextEditor';

const meta = {
  title: 'Custom/RichTextEditor',
  component: RichTextEditor,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    disabled: false,
  },
};

export const WithContent: Story = {
  args: {
    value: 'This is a rich description for a TV serie. It can contain multiple paragraphs and formatted text.',
    disabled: false,
  },
};

export const WithError: Story = {
  args: {
    value: '',
    disabled: false,
    error: 'Description is required',
  },
};

export const Disabled: Story = {
  args: {
    value: 'This content cannot be edited.',
    disabled: true,
  },
};
