
<script type="module">
  import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

  const supabase = createClient(
    "https://pkttryxmjdpjalxfalcl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdHRyeXhtamRwamFseGZhbGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjgyMTgsImV4cCI6MjA4NjE0NDIxOH0.A_ysvmwc0qEOOgHLM7rjBpUXrwvvQ64rHlwkggkC2dg"
  );

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    window.location.href = "index.html";
  }
</script>
