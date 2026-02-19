import argparse
import csv
import os
from datetime import datetime

import wandb


def load_tournament_rows(csv_path):
    with open(csv_path, newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        rows = list(reader)
    if not rows:
        raise ValueError(f"No rows found in CSV: {csv_path}")
    return rows


def to_int(value, default=0):
    try:
        return int(value)
    except Exception:
        return default


def to_float(value, default=0.0):
    try:
        return float(value)
    except Exception:
        return default


def build_summary(rows):
    total_games = 0
    total_wins = 0
    total_ties = 0
    total_losses = 0

    for row in rows:
        total_games += to_int(row.get("Games", 0))
        total_wins += to_int(row.get("Wins", 0))
        total_ties += to_int(row.get("Ties", 0))
        total_losses += to_int(row.get("Losses", 0))

    overall_win_rate = (100.0 * total_wins / total_games) if total_games > 0 else 0.0

    return {
        "total_games": total_games,
        "total_wins": total_wins,
        "total_ties": total_ties,
        "total_losses": total_losses,
        "overall_win_rate_percent": round(overall_win_rate, 2),
    }


def log_rows_and_summary(run, rows):
    for index, row in enumerate(rows, start=1):
        opponent = row.get("Opponent", "Unknown")
        wins = to_int(row.get("Wins", 0))
        ties = to_int(row.get("Ties", 0))
        losses = to_int(row.get("Losses", 0))
        games = to_int(row.get("Games", 0))
        win_rate = to_float(row.get("WinRatePercent", 0.0))

        run.log(
            {
                "opponent_index": index,
                "wins": wins,
                "ties": ties,
                "losses": losses,
                "games": games,
                "win_rate_percent": win_rate,
            },
            step=index,
        )

    for row in rows:
        opponent = row.get("Opponent", "Unknown")
        safe_opponent = opponent.replace(" ", "_").replace("/", "_")
        run.summary[f"wins_vs_{safe_opponent}"] = to_int(row.get("Wins", 0))
        run.summary[f"ties_vs_{safe_opponent}"] = to_int(row.get("Ties", 0))
        run.summary[f"losses_vs_{safe_opponent}"] = to_int(row.get("Losses", 0))
        run.summary[f"winrate_vs_{safe_opponent}"] = to_float(row.get("WinRatePercent", 0.0))

    summary = build_summary(rows)
    for key, value in summary.items():
        run.summary[key] = value


def upload_artifacts(run, csv_path, raw_path):
    artifact = wandb.Artifact("microrts-pa3-results", type="evaluation")
    artifact.add_file(csv_path)
    if raw_path and os.path.exists(raw_path):
        artifact.add_file(raw_path)
    run.log_artifact(artifact)


def parse_args():
    parser = argparse.ArgumentParser(description="Upload MicroRTS PA3 results to WandB")
    parser.add_argument("--csv", default="tournament.csv", help="Path to tournament CSV file")
    parser.add_argument("--raw", default="results.txt", help="Path to raw results text file")
    parser.add_argument("--project", default="CS4880-PA3", help="WandB project name")
    parser.add_argument("--entity", default=None, help="WandB entity/team (optional)")
    parser.add_argument("--run-name", default=None, help="Run name (optional)")
    parser.add_argument("--tag", action="append", default=[], help="Tag(s) for this run")
    return parser.parse_args()


def main():
    args = parse_args()

    if not os.path.exists(args.csv):
        raise FileNotFoundError(f"CSV file not found: {args.csv}")

    rows = load_tournament_rows(args.csv)

    run_name = args.run_name or f"AdaptiveRushBot-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

    run = wandb.init(
        project=args.project,
        entity=args.entity,
        name=run_name,
        tags=args.tag,
        config={
            "bot": rows[0].get("Bot", "AdaptiveRushBot"),
            "source_csv": os.path.abspath(args.csv),
            "source_raw_results": os.path.abspath(args.raw) if args.raw else None,
        },
    )

    log_rows_and_summary(run, rows)
    upload_artifacts(run, args.csv, args.raw)

    run_url = run.url
    run.finish()
    print(f"WandB run created: {run_url}")


if __name__ == "__main__":
    main()
