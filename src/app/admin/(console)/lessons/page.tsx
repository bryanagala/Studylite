import {
  deleteLessonAction,
  upsertLessonAction,
} from "@/app/admin/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminFlashForm } from "@/components/admin/flash-form";

const defaultContent = JSON.stringify(
  [
    {
      heading: "Section title",
      body: "Short lesson paragraph.",
      keyConcept: "Optional key concept",
      remember: "Optional remember tip",
    },
  ],
  null,
  2
);

export default async function AdminLessonsPage() {
  const supabase = await createServerSupabaseClient();
  const [{ data: lessons }, { data: topics }] = supabase
    ? await Promise.all([
        supabase.from("lessons").select("*").order("title"),
        supabase.from("topics").select("id, name").order("name"),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Lessons</h1>
        <p className="mt-1 text-slate-400">
          Content is JSON sections: heading, body, optional keyConcept/remember.
        </p>
      </header>

      <AdminFlashForm
        action={upsertLessonAction}
        title="Add / update lesson"
        fields={
          <>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-300">Topic</span>
              <select
                name="topic_id"
                required
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 text-white"
              >
                <option value="">Select topic</option>
                {(topics || []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <Field name="title" label="Title" placeholder="Introduction to Cells" required />
            <Field name="estimated_minutes" label="Minutes" placeholder="5" required />
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-300">Difficulty</span>
              <select
                name="difficulty"
                defaultValue="easy"
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 text-white"
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-300">Content JSON</span>
              <textarea
                name="content_json"
                required
                rows={8}
                defaultValue={defaultContent}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-white"
              />
            </label>
          </>
        }
      />

      <div className="overflow-hidden rounded-3xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Lesson</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Mins</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(lessons || []).map((l) => (
              <tr key={l.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-semibold text-white">{l.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{l.topic_id}</td>
                <td className="px-4 py-3">{l.estimated_minutes}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteLessonAction}>
                    <input type="hidden" name="id" value={l.id} />
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
