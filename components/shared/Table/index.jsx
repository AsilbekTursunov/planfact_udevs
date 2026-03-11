import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"

const data = [{ id: 1, name: 'Ada' }]
const columns = [{ accessorKey: 'name', header: 'Name' }]

const CustomTable = () => {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
  return <>
    <span>Tanstack table</span>

    {/* Render — oddiy rows bilan bir xil, tanstack o'zi flatten qiladi */}
    <table>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((header) => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </>

}

export default CustomTable

