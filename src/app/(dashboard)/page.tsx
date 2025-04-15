"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Play, Pause, ChevronRight, ChevronDown, Download, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const PROTOCOLS = ["ALL", "HTTP", "HTTPS", "DNS", "TCP", "UDP", "ICMP"]

// Cores para diferentes protocolos
const protocolColors: Record<string, string> = {
  HTTP: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  HTTPS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  DNS: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  TCP: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  UDP: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  ICMP: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function Page() {
  const [packets, setPackets] = useState<any[]>([])
  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState(0)
  const [filter, setFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPacket, setSelectedPacket] = useState<any | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ethernet: true,
    ip: true,
    transport: true,
    application: true,
  })
  const packetCount = useRef(0)

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001")
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === "packet" && !paused) {
        const data = msg.data
        packetCount.current++
        setPackets((prev) => [data, ...prev.slice(0, 1000)])
      }
    }
    return () => ws.close()
  }, [paused])

  useEffect(() => {
    const interval = setInterval(() => {
      setRate(packetCount.current)
      packetCount.current = 0
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const clearPackets = () => {
    setPackets([])
    setSelectedPacket(null)
  }

  const filteredPackets = packets.filter((p) => {
    // Aplicar filtro de protocolo
    if (filter && p.application.protocol !== filter) return false

    // Aplicar filtro de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        p.ip.src.toLowerCase().includes(query) ||
        p.ip.dst.toLowerCase().includes(query) ||
        (p.transport.srcPort && p.transport.srcPort.toString().includes(query)) ||
        (p.transport.dstPort && p.transport.dstPort.toString().includes(query)) ||
        p.application.protocol.toLowerCase().includes(query) ||
        (p.application.payload && p.application.payload.toLowerCase().includes(query))
      )
    }

    return true
  })

  // Formatar bytes para exibição hexadecimal com espaçamento
  const formatHexBytes = (hexString: string) => {
    if (!hexString) return ""

    // Remover espaços existentes e dividir em pares de caracteres (bytes)
    const bytes = hexString.replace(/\s+/g, "").match(/.{1,2}/g) || []

    // Agrupar em linhas de 16 bytes
    const lines = []
    for (let i = 0; i < bytes.length; i += 16) {
      const lineBytes = bytes.slice(i, i + 16)
      const offset = i.toString(16).padStart(4, "0")

      // Bytes em hex
      const hexPart = lineBytes.join(" ").padEnd(47, " ")

      // Bytes como ASCII (quando possível)
      const asciiPart = lineBytes
        .map((byte) => {
          const charCode = Number.parseInt(byte, 16)
          return charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : "."
        })
        .join("")

      lines.push(`${offset}: ${hexPart} | ${asciiPart}`)
    }

    return lines.join("\n")
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Barra de ferramentas */}
      <div className="border-b bg-muted/40 p-2 flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="icon" onClick={() => setPaused((p) => !p)} className="h-8 w-8">
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={clearPackets}
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          title="Limpar histórico"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Pacotes/s:</span>
          <Badge variant="secondary" className="h-6">
            {rate}
          </Badge>
        </div>

        <div className="flex gap-1 flex-wrap">
          {PROTOCOLS.map((p) => (
            <Badge
              key={p}
              variant={filter === p || (p === "ALL" && !filter) ? "default" : "outline"}
              className="cursor-pointer h-6"
              onClick={() => setFilter(p === "ALL" ? null : p)}
            >
              {p}
            </Badge>
          ))}
        </div>

        <div className="flex-1 max-w-md ml-auto">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar pacotes..."
              className="pl-8 h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de pacotes */}
      <div className="border-b flex-none overflow-auto" style={{ height: "40%" }}>
        <div className="min-w-max">
          <div className="sticky top-0 bg-background border-b text-xs font-medium grid grid-cols-12 gap-0">
            <div className="col-span-1 p-2 border-r">No.</div>
            <div className="col-span-2 p-2 border-r">Tempo</div>
            <div className="col-span-2 p-2 border-r">Origem</div>
            <div className="col-span-2 p-2 border-r">Destino</div>
            <div className="col-span-1 p-2 border-r">Protocolo</div>
            <div className="col-span-1 p-2 border-r">Tamanho</div>
            <div className="col-span-3 p-2">Info</div>
          </div>

          <div className="text-xs">
            {filteredPackets.map((packet, index) => (
              <div
                key={index}
                className={cn(
                  "grid grid-cols-12 gap-0 hover:bg-muted/50 cursor-pointer",
                  selectedPacket === packet ? "bg-muted" : index % 2 === 0 ? "bg-background" : "bg-muted/20",
                )}
                onClick={() => setSelectedPacket(packet)}
              >
                <div className="col-span-1 p-2 border-r truncate">{index + 1}</div>
                <div className="col-span-2 p-2 border-r truncate">
                  {new Date(packet.frame.timestamp).toLocaleTimeString()}
                </div>
                <div className="col-span-2 p-2 border-r truncate">
                  {packet.ip.src}
                  {packet.transport.srcPort ? `:${packet.transport.srcPort}` : ""}
                </div>
                <div className="col-span-2 p-2 border-r truncate">
                  {packet.ip.dst}
                  {packet.transport.dstPort ? `:${packet.transport.dstPort}` : ""}
                </div>
                <div className="col-span-1 p-2 border-r">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-xs font-medium",
                      protocolColors[packet.application.protocol] ||
                        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                    )}
                  >
                    {packet.application.protocol}
                  </span>
                </div>
                <div className="col-span-1 p-2 border-r truncate">{packet.frame.length}</div>
                <div className="col-span-3 p-2 truncate">
                  {packet.transport.protocol} {packet.transport.srcPort} → {packet.transport.dstPort}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detalhes do pacote */}
      <div className="flex-1 overflow-hidden flex">
        {selectedPacket ? (
          <div className="flex flex-col md:flex-row w-full">
            {/* Painel de detalhes */}
            <div className="md:w-1/2 overflow-auto border-r p-2">
              <div className="text-sm font-medium mb-2">Detalhes do Pacote</div>

              {/* Frame */}
              <div className="mb-2">
                <div
                  className="flex items-center cursor-pointer hover:bg-muted/50 p-1 rounded"
                  onClick={() => toggleSection("frame")}
                >
                  {expandedSections.frame ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-medium">Frame: {selectedPacket.frame.length} bytes</span>
                </div>
                {expandedSections.frame && (
                  <div className="pl-6 text-xs space-y-1">
                    <div>Tamanho do frame: {selectedPacket.frame.length} bytes</div>
                    <div>Timestamp: {new Date(selectedPacket.frame.timestamp).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Ethernet */}
              <div className="mb-2">
                <div
                  className="flex items-center cursor-pointer hover:bg-muted/50 p-1 rounded"
                  onClick={() => toggleSection("ethernet")}
                >
                  {expandedSections.ethernet ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-medium">Ethernet</span>
                </div>
                {expandedSections.ethernet && (
                  <div className="pl-6 text-xs space-y-1">
                    <div>MAC Origem: {selectedPacket.ethernet.src}</div>
                    <div>MAC Destino: {selectedPacket.ethernet.dst}</div>
                    <div>Tipo: 0x0800 (IPv4)</div>
                  </div>
                )}
              </div>

              {/* IP */}
              <div className="mb-2">
                <div
                  className="flex items-center cursor-pointer hover:bg-muted/50 p-1 rounded"
                  onClick={() => toggleSection("ip")}
                >
                  {expandedSections.ip ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-medium">Internet Protocol Version 4</span>
                </div>
                {expandedSections.ip && (
                  <div className="pl-6 text-xs space-y-1">
                    <div>Versão: 4</div>
                    <div>Endereço Origem: {selectedPacket.ip.src}</div>
                    <div>Endereço Destino: {selectedPacket.ip.dst}</div>
                    <div>Protocolo: {selectedPacket.ip.protocol}</div>
                  </div>
                )}
              </div>

              {/* Transporte */}
              <div className="mb-2">
                <div
                  className="flex items-center cursor-pointer hover:bg-muted/50 p-1 rounded"
                  onClick={() => toggleSection("transport")}
                >
                  {expandedSections.transport ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-medium">{selectedPacket.transport.protocol}</span>
                </div>
                {expandedSections.transport && (
                  <div className="pl-6 text-xs space-y-1">
                    <div>Porta Origem: {selectedPacket.transport.srcPort}</div>
                    <div>Porta Destino: {selectedPacket.transport.dstPort}</div>
                  </div>
                )}
              </div>

              {/* Aplicação */}
              <div className="mb-2">
                <div
                  className="flex items-center cursor-pointer hover:bg-muted/50 p-1 rounded"
                  onClick={() => toggleSection("application")}
                >
                  {expandedSections.application ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-medium">{selectedPacket.application.protocol}</span>
                </div>
                {expandedSections.application && (
                  <div className="pl-6 text-xs">
                    <pre className="bg-black text-green-300 p-2 rounded border whitespace-pre-wrap mt-1 overflow-auto max-h-64">
                      {selectedPacket.application.payload}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Painel hexadecimal */}
            <div className="md:w-1/2 overflow-auto p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Dados Hexadecimais</div>
                <Button variant="outline" size="sm" className="h-7">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Exportar
                </Button>
              </div>
              <pre className="bg-black text-green-500 p-2 rounded border font-mono text-xs overflow-auto whitespace-pre">
                {formatHexBytes(selectedPacket.application.rawPayload)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full text-muted-foreground">
            Selecione um pacote para ver os detalhes
          </div>
        )}
      </div>
    </div>
  )
}