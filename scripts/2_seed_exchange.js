const config = require('../src/config.json')

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait  = (seconds) => {
	const milliseconds = seconds * 1000
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {

	const accounts = await ethers.getSigners()

	const { chainId } = await ethers.provider.getNetwork()
	console.log("Using chainId:", chainId)


	const XION = await ethers.getContractAt('Token', config[chainId].XION.address)
	console.log(`Xion Token fetched: ${XION.address}`)

	const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
	console.log(`mETH Token fetched: ${mETH.address}`)

	const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
	console.log(`mDAI Token fetched: ${mDAI.address}`)

	const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
	console.log(`Exchange fetched: ${exchange.address}`)

	const sender = accounts[0]
	const receiver = accounts[1]
	let amount = tokens(10000)

	let transaction, result
	transaction = await mETH.connect(sender).transfer(receiver.address, amount)
	console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

	const user1 = accounts[0]
	const user2 = accounts[1]
	amount = tokens(10000)



	transaction = await XION.connect(user1).approve(exchange.address, amount)
	await transaction.wait()
	console.log(`Approved ${amount} tokens from ${user1.address}`)

	transaction = await exchange.connect(user1).depositToken(XION.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} Ether from ${user1.address}\n`)

	transaction = await mETH.connect(user2).approve(exchange.address, amount)
	await transaction.wait()
	console.log(`Approved ${amount} tokens from ${user2.address}`)

	transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} tokens from ${user2.address}\n`)



	let orderId
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), XION.address, tokens(5))
	result = await transaction.wait()
	console.log(`Make order from ${user1.address}`)

	orderId = result.events[0].args.id
	transaction = await exchange.connect(user1).cancelOrder(orderId)
	result = await transaction.wait()
	console.log(`Cancelled order from ${user1.address}\n`)

	await wait(1)



	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), XION.address, tokens(10))
	result = await transaction.wait()
	console.log(`Make order from ${user1.address}`)

	orderId = result.events[0].args.id 
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	await wait(1)



	transaction = await exchange.makeOrder(mETH.address, tokens(50), XION.address, tokens(15))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	orderId = result.events[0].args.id 
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	await wait(1)



	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), XION.address, tokens(20))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	orderId = result.events[0].args.id 
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	await wait(1)

	for(let i = 1; i <= 10; i++) {
		transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), XION.address, tokens(10))
		result = await transaction.wait()

		console.log(`Made order from ${user1.address}`)

		await wait(1)
	}

	for(let i = 1; i <= 10; i++) {
		transaction = await exchange.connect(user2).makeOrder(XION.address, tokens(10), mETH.address, tokens(10 * i))
		result = await transaction.wait()

		console.log(`Made order from ${user2.address}`)

		await wait(1)
	}

	


}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})