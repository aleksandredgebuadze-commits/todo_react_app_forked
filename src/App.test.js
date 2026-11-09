import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

function openNewTaskDialog() {
	render(<App />);

	userEvent.click(screen.getByRole('button', { name: 'New Task' }));
}

function titleField() {
	return screen.getByLabelText(/title/i);
}

function summaryField() {
	return screen.getByLabelText(/summary/i);
}

async function expectDialogClosed() {
	await waitFor(() =>
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	);
}

beforeEach(() => {
	localStorage.clear();
});

test('pressing Enter in the Title field creates the task and closes the dialog', async () => {
	openNewTaskDialog();

	userEvent.type(titleField(), 'Buy milk{enter}');

	expect(await screen.findByText('Buy milk')).toBeInTheDocument();
	await expectDialogClosed();
});

test('pressing Enter in the Summary field creates the task with both fields', async () => {
	openNewTaskDialog();

	userEvent.type(titleField(), 'Buy milk');
	userEvent.type(summaryField(), 'Two litres{enter}');

	expect(await screen.findByText('Buy milk')).toBeInTheDocument();
	expect(screen.getByText('Two litres')).toBeInTheDocument();
	await expectDialogClosed();
});

test('clicking Create Task creates the task without typing Enter', async () => {
	openNewTaskDialog();

	userEvent.type(titleField(), 'Call the plumber');
	userEvent.click(screen.getByRole('button', { name: 'Create Task' }));

	expect(await screen.findByText('Call the plumber')).toBeInTheDocument();
	await expectDialogClosed();
});

test('clicking Cancel only closes the dialog', async () => {
	openNewTaskDialog();

	userEvent.type(titleField(), 'Discarded task');
	userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

	await expectDialogClosed();
	expect(screen.queryByText('Discarded task')).not.toBeInTheDocument();
	expect(JSON.parse(localStorage.getItem('tasks') || '[]')).toEqual([]);
});

test('the Title field is focused when the dialog opens', async () => {
	openNewTaskDialog();

	await waitFor(() => expect(titleField()).toHaveFocus());
});

test('the Title field is required, so an empty title cannot be submitted', () => {
	openNewTaskDialog();

	expect(titleField()).toBeRequired();
});
