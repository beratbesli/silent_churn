import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import CustomerCard from './CustomerCard';

const customer = {
  id: 42,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  risk_status: 'at_risk',
  current_risk_score: 0.87,
  risk_reason: 'Recent activity shows a sustained drop in engagement.',
};

describe('CustomerCard', () => {
  it('renders the customer risk summary', () => {
    render(
      <MemoryRouter>
        <CustomerCard customer={customer} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByText('87%')).toBeInTheDocument();
    expect(screen.getByText('at risk')).toBeInTheDocument();
    expect(screen.getByText(customer.risk_reason)).toBeInTheDocument();
  });

  it('navigates to the customer detail route when selected', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CustomerCard customer={customer} />} />
          <Route path="/customer/:id" element={<p>Customer detail loaded</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('heading', { name: 'Ada Lovelace' }));

    expect(screen.getByText('Customer detail loaded')).toBeInTheDocument();
  });
});
