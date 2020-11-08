<script lang="ts">
	import type {Message} from '../../interfaces/chat'
	export let message: Message
</script>

<div class="message__container">
	<div class="message__header">
		<p class="message__text">{message.date}</p>
	</div>

	<div class="message__body">
		<div class="message__block">
			{#each message.messages as msg}
				<div class="message__sub_header">{msg.author} {msg.timestamp.toString().slice(16, 21)}</div>
				{#each msg.text as text}
					{text}
					<br />
				{/each}	
			{/each}
		</div>
	</div>
</div>

<style>
	.message__container {
		/* display: flex;
        width: 100%; */
		margin: 6px 0;
	}

	.message__header {
		margin-top: 12px;
		margin-top: 10px;
		font-weight: bold;
		text-align: center;
		padding: 5px;
	}

	.message__sub_header {
		margin-top: 6px;
		margin-top: 6px;
		font-weight: bold;
	}

	.message__block {
		margin: 0px 0px 0px 0px;
		border-radius: 8px;
		padding: 5px;	
		background: #dddddd;
	}

	.message__text {
		margin: 6px 0px 0px 0px;
	}
</style>
