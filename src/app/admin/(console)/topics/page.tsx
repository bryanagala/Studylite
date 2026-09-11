import {
  deleteTopicAction,
  upsertTopicAction,
} from "@/app/admin/actions";
import { listSubjectsAdmin, listTopicsAdmin } from "@/lib/admin/repo";
import { AdminFlashForm } from "@/components/admin/flash-form";

export default async function AdminTopicsPage() {
  const [topics, subjects] = await Promise.all([
    listTopicsAdmin(),
    listSubjectsAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Topics</h1>
        <p className="mt-1 text-slate-400">Attach topics under a subject.</p>
      </header>

      <AdminFlashForm
        action={upsertTopicAction}
        title="Add / update topic"
        fields={
          <>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-300">Subject</span>
              <select
                name="subject_id"
                required
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 text-white"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </label>
            <Field name="name" label="Name" placeholder="Genetics" required />
            <Field
              name="description"
              label="Description"
              placeholder="Inheritance and variation"
              required
            />
          </>
        }
      />

      <div className="overflow-hidden rounded-3xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {topics.map((t) => (
              <tr key={t.id} className="border-t border-slate-800">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.description}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.subject_id}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteTopicAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="text-xs font-bold text-rose-400">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field(props: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-300">{props.label}</span>
      <input
        name={props.name}
        required={props.required}
        placeholder={props.placeholder}
        className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 text-white"
      />
    </label>
  );
}
