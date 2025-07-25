import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ConsultaCepProps {
  onAddressFound: (address: any) => void
}

// O componente é definido como uma constante
export const ConsultaCep = ({ onAddressFound }: ConsultaCepProps) => {
  const [cep, setCep] = useState('')

  const handleCepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCep(event.target.value)
  }

  const handleSearchCep = async () => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (!data.erro) {
          onAddressFound(data)
        } else {
          alert('CEP não encontrado.')
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
        alert('Erro ao buscar CEP.')
      }
    }
  }

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder="CEP"
        value={cep}
        onChange={handleCepChange}
        maxLength={8}
      />
      <Button type="button" onClick={handleSearchCep}>
        Buscar
      </Button>
    </div>
  )
}