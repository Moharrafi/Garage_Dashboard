export async function apiFetch<T>(input: string, init: RequestInit = {}) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || "Permintaan gagal")
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}
