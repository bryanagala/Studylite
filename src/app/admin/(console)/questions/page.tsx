import {
  deleteQuestionAction,
  upsertQuestionAction,
} from "@/app/admin/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminFlashForm } from "@/components/admin/flash-form";

export default async function AdminQuestionsPage() {
  const supabase = await createServerSupabaseClient();
  const [{ data: questions }, { data: lessons }, { data: topics }] = supabase
    ? await Promise.all([
        supabase.from("questions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("lessons").select("id, title, topic_id").order("title"),
        supabase.from("topics").select("id, name").order("name"),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Questions</h1>
        <p className="mt-1 text-slate-400">
          Options must be a JSON string array. Correct answer must match one option.
        </p>
      </header>

      <AdminFlashForm
        action={upsertQuestionAction}
        title="Add / update question"
        fields={
          <>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-300">Lesson</span>
              <select
                name="lesson_id"
                required
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 text-white"
              >
                <option value="">Select lesson</option>
                {(lessons || []).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </label>
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
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-300">Question</span>
              <textarea
                name="question_text"
                required
                rows={2}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-300">Type</span>
              <select
                name="question_type"
                defaultValue="multiple_choice"
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 text-white"
              >
                <option value="multiple_choice">multiple_choice</option>
                <option value="true_false">true_false</option>
              </select>
            </label>
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
              <span className="mb-1 block font-medium text-slate-300">Options JSON</span>
              <input
                name="options_json"
                required
                defaultValue='["Option A","Option B","Option C","Option D"]'
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 font-mono text-xs text-white"
              />
            </label>
            <Field name="correct_answer" label="Correct answer" required />
            <Field name="explanation" label="Explanation" required />
          </>
        }
      />

      <div className="overflow-hidden rounded-3xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Lesson</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(questions || []).map((q) => (
              <tr key={q.id} className="border-t border-slate-800">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{q.question_text}</p>
                  <p className="text-xs text-slate-500">
                    {q.question_type} · {q.difficulty} · answer: {q.correct_answer}
                  </p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{q.lesson_id}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteQuestionAction}>
                    <input type="hidden" name="id" value={q.id} />
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

function Field(props: { name: string; label: string; required?: boolean }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-300">{props.label}</span>
      <input
        name={props.name}
        required={props.required}
        className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 text-white"
      />
    </label>
  );
}
