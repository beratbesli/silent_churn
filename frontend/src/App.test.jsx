import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import App from './App';
import api from './api/client';

vi.mock('./api/client', () => ({
  default: { setAccessToken: vi.fn(), getCurrentProvider: vi.fn() },
}));
vi.mock('./pages/ModelSelection', () => ({ default: () => <p>Model selection</p> }));
vi.mock('./components/ChatWidget', () => ({ default: () => null }));

beforeEach(() => vi.clearAllMocks());

it('keeps customer routes locked until the backend accepts the access key', async () => {
  api.getCurrentProvider.mockRejectedValueOnce(new Error('Unauthorized'))
    .mockResolvedValueOnce({ provider: 'none' });
  const user = userEvent.setup();
  render(<MemoryRouter><App /></MemoryRouter>);

  expect(screen.getByText('Silent Churn access')).toBeInTheDocument();
  expect(screen.queryByText('Model selection')).not.toBeInTheDocument();
  await user.type(screen.getByLabelText('Access key'), 'wrong');
  await user.click(screen.getByRole('button', { name: 'Unlock' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid access key');
  expect(screen.queryByText('Model selection')).not.toBeInTheDocument();

  await user.clear(screen.getByLabelText('Access key'));
  await user.type(screen.getByLabelText('Access key'), 'correct');
  await user.click(screen.getByRole('button', { name: 'Unlock' }));
  expect(await screen.findByText('Model selection')).toBeInTheDocument();
  expect(api.setAccessToken).toHaveBeenCalledWith('correct');
});
