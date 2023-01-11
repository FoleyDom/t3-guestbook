import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { api } from '../utils/api'
import Footer from '../components/Footer'
import { PrismaClient } from '@prisma/client'

const Messages = () => {
	const { data: messages, isLoading } = api.guestbook.getAll.useQuery()
	const { data: session } = useSession()
	const [d, setD] = useState('')
	const utils = api.useContext()

	if (isLoading) return <div>Fetching messages...</div>

	//make sure user is logged in
	//make sure user is the author of the message
	//get id of message to delete
	//delete message

	const deleteMessage = api.guestbook.deleteMessage.useMutation({
		onMutate: async () => {
			await utils.guestbook.getAll.cancel()
			const optimisticUpdate = utils.guestbook.getAll.getData()

			if (optimisticUpdate) {
				utils.guestbook.getAll.setData(undefined, optimisticUpdate)
			}
		},
		onSettled: async () => {
			await utils.guestbook.getAll.invalidate()
		},
	})

	return (
		<div className="flex flex-col gap-4">
			{messages?.map((msg, index) => {
				return (
					<div key={index}>
						<p>{msg.message}</p>
						<span>- {msg.name}</span>
						<button
							onClick={(e) => {
								e.preventDefault()

								if (session !== null) {
									setD('')
									console.log(`deleted message ${d}`)
									deleteMessage.mutate({
										id: session.user?.id,
									})
								}
							}}
						>
							Delete
						</button>
					</div>
				)
			})}
		</div>
	)
}

const Form = () => {
	const { data: session } = useSession()
	const [message, setMessage] = useState('')
	const utils = api.useContext()
	const postMessage = api.guestbook.postMessage.useMutation({
		onMutate: async () => {
			await utils.guestbook.getAll.cancel()
			const optimisticUpdate = utils.guestbook.getAll.getData()

			if (optimisticUpdate) {
				utils.guestbook.getAll.setData(undefined, optimisticUpdate)
			}
		},
		onSettled: async () => {
			await utils.guestbook.getAll.invalidate()
		},
	})

	return (
		<form
			className="flex gap-2"
			onSubmit={(event) => {
				event.preventDefault()

				if (session !== null) {
					postMessage.mutate({
						name: session.user?.name as string,
						message,
					})
				}

				setMessage('')
			}}
		>
			<input
				type="text"
				value={message}
				placeholder="Your message..."
				minLength={2}
				maxLength={100}
				onChange={(event) => setMessage(event.target.value)}
				className="px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none"
			/>
			<button type="submit" className="p-2 rounded-md border-2 border-zinc-800 focus:outline-none">
				Submit
			</button>
		</form>
	)
}

const Home = () => {
	const { data: session, status } = useSession()

	if (status === 'loading') {
		return <main className="flex flex-col items-center pt-4">Loading...</main>
	}

	return (
		<>
			<main className="flex flex-col items-center">
				<h1 className="text-3xl pt-4">Guestbook</h1>
				<p>
					Project using <code>create-t3-app</code>
				</p>

				<div className="pt-10">
					<div>
						{session ? (
							<>
								<p>hi {session.user?.name}</p>

								<button
									type="button"
									className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
									onClick={() => void signOut()}
								>
									Logout
								</button>

								<div className="pt-6">
									<Form />
								</div>
							</>
						) : (
							<button
								type="button"
								className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
								onClick={() => void signIn('discord')}
							>
								Login with Discord
							</button>
						)}
						<div className="pt-10">
							<Messages />
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	)
}

export default Home
