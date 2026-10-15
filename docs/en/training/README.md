# MADRE AI · train the project's model

Roadmap 2c. The room exports what it remembers as chat pairs; you train a small model with them on your machine; Ollama serves it; `@madre` uses it as soon as it exists. All local.

## 1 · Export

From MU/TH/UR → `⚙ CONNECTIONS` → `MEMORY` → `EXPORT DATASET`, or in the terminal:

```
madre dataset            # in the project folder
```

It writes `~/.pulse/rooms/<sala>/dataset/{train.jsonl, valid.jsonl, manifest.json}`. Each line is `{"messages":[{role:"system"},{role:"user"},{role:"assistant"}]}`: the room's real turns, redacted (no paths, names, emails or keys), plus the distilled notes as recall pairs. GHOST is never there.

How much you need: with fewer than ~200 pairs the model learns the tone and little more; from ~1000 on it starts to be worth it. Export every so often; the split is deterministic, so lines don't switch sides.

## 2 · Train (Apple Silicon, mlx-lm)

```
python3 -m venv ~/.madre-train && source ~/.madre-train/bin/activate
pip install mlx-lm
cd ~/.pulse/rooms/<sala>
mlx_lm.lora --model Qwen/Qwen2.5-1.5B-Instruct --train --data dataset --iters 600 --batch-size 2 --learning-rate 1e-5 --adapter-path adapters
mlx_lm.lora --model Qwen/Qwen2.5-1.5B-Instruct --adapter-path adapters --data dataset --test
```

### Linux with NVIDIA (experimental)

MLX publishes a CUDA package for Linux (CUDA 12, compute capability 7.5 or higher, driver 550.54.14 or higher, glibc 2.35, Python 3.10): <https://ml-explore.github.io/mlx/build/html/install.html>. mlx-lm only documents Apple silicon, so test it first:

```
python3 -m venv ~/.madre-train && source ~/.madre-train/bin/activate
pip install "mlx[cuda12]" mlx-lm
python3 -c "import mlx.core as mx; print('CUDA:', mx.cuda.is_available())"   # must say True
```

If it says `True`, the steps below are the same. If not, there's no tested path on Linux yet.

[`train.sh`](../../training/train.sh) in `docs/training/` does the same with checks. On 16 GB use the 1.5B; with 32 GB or more, `Qwen/Qwen2.5-3B-Instruct` or `Qwen/Qwen2.5-Coder-7B-Instruct` with `--batch-size 1`. A round of 600 iterations takes 10 to 40 minutes.

## 3 · Serve in Ollama

```
mlx_lm.fuse --model Qwen/Qwen2.5-1.5B-Instruct --adapter-path adapters --save-path fused
```

Ollama reads GGUF. For Llama and Mistral `mlx_lm.fuse` accepts `--export-gguf`; for Qwen convert with llama.cpp:

```
git clone --depth 1 https://github.com/ggml-org/llama.cpp && pip install -r llama.cpp/requirements.txt
python3 llama.cpp/convert_hf_to_gguf.py fused --outfile madre.gguf --outtype q8_0
cp docs/training/Modelfile . && ollama create madre-<proyecto> -f Modelfile
```

The name matters: `madre-<proyecto>` in lowercase, with hyphens. At the next `RECHECK` in MODULES → OLLAMA, `@madre` switches to that model and the MEMORY card says so.

## 4 · Evaluate before trusting

Before promoting a new model, ask `@madre` the ten things the room did decide and the five it never discussed. It should get the first ones right and say "the room never discussed it" for the second ones. If it makes things up, go back to the base model (`ollama rm madre-<proyecto>`) and train with more pairs or fewer iterations.
