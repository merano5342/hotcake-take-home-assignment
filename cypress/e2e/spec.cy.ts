describe('McDonald Order Management', () => {
	beforeEach(() => {
		cy.visit('http://localhost:3000');
	});

	describe('UI Elements', () => {
		it('should have init ui elements', () => {
			cy.get('.role-panel-manger button.add-bot').should('exist');
			cy.get('.role-panel-manger button.remove-bot').should('exist');
			cy.get('.role-panel-vip button.add-vip-order').should('exist');
			cy.get('.role-panel-normal button.add-normal-order').should('exist');

			cy.get('.list-pending').should('exist');
			cy.get('.list-complete').should('exist');
			cy.get('.list-bots').should('exist');
		});
	});

	describe('Customer Order Flow', () => {
		it('should display order in PENDING area after "new order" button been click', () => {
			cy.get('button.add-normal-order').click();
			cy.get('button.add-vip-order').click();

			cy.get('.list-pending .order').should('exist');
			cy.get('.list-pending .order').should('contain', 'VIP');
		});

		it('Should move order to COMPLETE area after cooking bot processing', () => {
			cy.get('button.add-normal-order').click();
			cy.get('button.add-bot').click();

			cy.wait(10000);

			cy.get('.list-complete').find('.order').should('have.length', 1);
			cy.get('.list-pending .order-id').should('not.exist');
		});
	});

	describe('Bot Management', () => {
		it('should create a bot and start processing the pending order', () => {
			cy.get('button.add-normal-order').click();

			cy.get('.list-pending .order-id').then((orders) => {
				const orderIds = [...orders].map((order) =>
					order.textContent ? parseInt(order.textContent.trim()) : 0
				);

				cy.get('button.add-bot').click();
				cy.get('.list-bots .bot').should('exist');

				cy.get('.list-bots .bot-status').should(
					'contain',
					orderIds[0].toString()
				);
			});
		});

		it('should destroy the newest bot when "- Bot" is clicked', () => {
			cy.get('button.add-bot').click();
			cy.get('button.add-bot').click();
			cy.get('button.add-bot').click();

			cy.get('.list-bots .bot-id').then((bots) => {
				const botIds = [...bots].map((bot) =>
					bot.textContent ? parseInt(bot.textContent.trim()) : 0
				);
				const maxBotId = Math.max(...botIds);

				cy.get('button.remove-bot').click();
				cy.get('.list-bots .bot-id').should('have.length', 2);
				cy.get('.list-bots .bot-id').should('not.contain', maxBotId.toString());
			});
		});
	});

	describe('Bot Processing Capacity', () => {
		it('should process only one order at a time', () => {
			cy.get('button.add-normal-order').click();
			cy.get('button.add-normal-order').click();
			cy.get('button.add-bot').click();

			cy.wait(2000);
			cy.get('.list-bots .bot-status').then((botStatus) => {
				const processingOrderId = botStatus.text().trim();

				cy.get('.list-pending .order-id').should('have.length', 1);
				cy.get('.list-pending .order-id')
					.first()
					.should('not.contain', processingOrderId);
			});
		});

		it('should set bot to IDLE if no more orders in PENDING area', () => {
			cy.get('button.add-normal-order').click();
			cy.get('button.add-bot').click();

			cy.wait(10000);
			cy.get('.list-pending .order-id').should('not.exist');

			cy.get('.list-bots .bot-status').should('contain', 'IDLE');
		});

		it('should stop processing order and return it to PENDING area when bot is removed', () => {
			cy.get('button.add-normal-order').click();
			cy.get('button.add-bot').click();

			cy.wait(2000);
			cy.get('.list-bots .bot-status').then((botStatus) => {
				const processingOrderId = botStatus.text().trim();

				cy.get('button.remove-bot').click();

				cy.get('.list-pending .order-id').should('have.length', 1);
				cy.get('.list-pending .order-id')
					.first()
					.should('contain', processingOrderId);
			});
		});

		it('should stop processing order and return it to PENDING area when bot is removed', () => {
			cy.get('button.add-normal-order').click();
			cy.get('button.add-bot').click();

			cy.wait(2000);
			cy.get('.list-bots .bot-status').then((botStatus) => {
				const processingOrderId = botStatus.text().trim();

				cy.get('button.remove-bot').click();

				cy.get('.list-pending .order-id').should('have.length', 1);
				cy.get('.list-pending .order-id')
					.first()
					.should('contain', processingOrderId);
			});
		});

		it('should correctly process an order after it is returned to the PENDING area due to bot removal', () => {
			cy.get('button.add-normal-order').click();
			cy.get('button.add-bot').click();

			cy.wait(2000);
			cy.get('.list-bots .bot-status').then((botStatus) => {
				const processingOrderId = botStatus.text().trim();

				cy.get('button.remove-bot').click();

				cy.get('.list-pending').should('have.length', 1);
				cy.get('.list-pending .order-id')
					.first()
					.should('contain', processingOrderId);

				cy.get('button.add-bot').click();
				cy.wait(10000);

				cy.get('.list-complete').should('have.length', 1);
				cy.get('.list-complete .order-id')
					.first()
					.should('contain', processingOrderId);
			});
		});
	});

	describe('Order sorting logic', () => {
		it('should ensure order numbers are unique and increasing', () => {
			cy.get('button.add-normal-order').click();
			cy.get('button.add-normal-order').click();
			cy.get('button.add-normal-order').click();

			cy.get('.list-pending .order-id').then((orders) => {
				const orderIds = [...orders].map((order) =>
					order.textContent ? parseInt(order.textContent.trim()) : 0
				);

				const uniqueOrderIds = [...new Set(orderIds)];
				expect(orderIds).to.deep.equal(uniqueOrderIds);
				expect(orderIds).to.deep.equal(uniqueOrderIds.sort((a, b) => a - b));
			});
		});

		it('should place VIP orders in front of normal orders in the PENDING area, and each type of orders should be sorted in ascending order', () => {
			cy.get('button.add-normal-order').click();
			cy.get('button.add-vip-order').click();
			cy.get('button.add-normal-order').click();
			cy.get('button.add-vip-order').click();

			cy.get('.list-pending .order').then((orders) => {
				const orderIds = [...orders].map((order) =>
					order.textContent ? parseInt(order.textContent.trim()) : 0
				);
				const vipOrders = [...orders].filter((order) =>
					order.textContent ? order.textContent.includes('VIP') : ''
				);
				const normalOrders = [...orders].filter((order) =>
					order.textContent ? !order.textContent.includes('VIP') : ''
				);

				expect(orderIds).to.deep.equal(orderIds.sort((a, b) => a - b));
				expect(vipOrders.length).to.be.greaterThan(0);
				expect(normalOrders.length).to.be.greaterThan(0);

				const vipOrderIds = vipOrders.map((order) =>
					parseInt(order.textContent ? order.textContent.trim() : '')
				);
				const normalOrderIds = normalOrders.map((order) =>
					parseInt(order.textContent ? order.textContent.trim() : '')
				);

				expect(vipOrderIds).to.deep.equal(vipOrderIds.sort((a, b) => a - b));
				expect(normalOrderIds).to.deep.equal(
					normalOrderIds.sort((a, b) => a - b)
				);
			});
		});
	});
});
