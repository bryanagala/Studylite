import {
  deleteSubjectAction,
  upsertSubjectAction,
} from "@/app/admin/actions";
import { listSubjectsAdmin } from "@/lib/admin/repo";
import { AdminFlashForm } from "@/components/admin/flash-form";

export default async function AdminSubjectsPage() {
  const subjects = await listSubjectsAdmin();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Subjects</h1>
        <p className="mt-1 text-slate-400">Create and edit top-level subjects.</p>
      </header>

      <AdminFlashForm
        action={upsertSubjectAction}
        title="Add / update subject"
        fields={
          <>
            <input type="hidden" name="id" />
            <Field name="name" label="Name" placeholder="Biology" required />
            <Field name="icon" label="Icon" placeholder="🧬" required />
            <Field name="description" label="Description" placeholder="Cells and genetics" required />
          </>
        }
      />

      <div className="overflow-hidden rounded-3xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-t border-slate-800">
                <td className="px-4 py-3">
                  <span className="mr-2">{s.icon}</span>
                  <span className="font-semibold text-white">{s.name}</span>
                  <p className="text-xs text-slate-500">{s.description}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.id}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteSubjectAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="text-xs font-bold text-rose-400">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!subjects.length ? (
          <p className="px-4 py-6 text-sm text-slate-500">No subjects yet. Add one above or run db:seed.</p>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-300">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 text-white"
      />
    </label>
  );
}
