<script lang="ts">
	import { brand } from '$lib/brand';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
</script>

<Card.Root>
	<Card.Header>
		<Card.Description>Sign up for {brand}</Card.Description>
		<Card.Title>How do you sign in to StudentVUE?</Card.Title>
	</Card.Header>

	<Card.Content class="flex flex-wrap gap-2">
		<Button href="/signup/google" variant="outline" size="lg" class="flex-1">with Google</Button>
		<Button href="/login" variant="outline" size="lg" class="flex-1">with a password</Button>
	</Card.Content>

	<Card.Footer>
		<p class="text-muted-foreground text-sm">
			Already used {brand}? <a href="/login" class="text-accent-foreground underline">Log in</a>
		</p>
	</Card.Footer>
</Card.Root>
