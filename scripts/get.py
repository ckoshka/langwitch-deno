#! /usr/bin/env nix-shell
#! nix-shell -i python -p python310 python310Packages.rich python310Packages.typer python310Packages.textual

from dataclasses import dataclass
import typer
import rich
from rich.table import Table
from rich.console import Console
import requests
import json
from typing import *
import random
from rich.live import Live
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import as_completed
from rich.prompt import Confirm
import os
from copy import deepcopy

@dataclass()
class DatasetEntry:
    name: str
    size_bytes: int

@dataclass
class Dataset:
    size: str
    source: str
    url: str
    language: str
    bytes: int
    name: str

def find(l: List[str], expression: Callable[[str], bool]) -> int | None:
    for i, item in enumerate(l):
        if expression(item):
            return i
    

# meaning the remaining part must be the translator

def to_dataset(entry: DatasetEntry) -> Dataset:
    parts = entry.name.split("-")

    #eng = parts[0]
    language = parts[1]
    source = parts[2]

    return Dataset(sizeof_fmt(entry.size_bytes), source, "https://archive.org/download/english-portuguese-statmt/" + entry.name, language, entry.size_bytes, entry.name)

def fetch():
    res: str = requests.get("https://archive.org/metadata/english-portuguese-statmt").text
    datasets: List[Dict[str, str]] = json.loads(res)["files"]
    return [
        to_dataset(DatasetEntry(
            name=d["name"], 
            size_bytes=int(d["size"])
        ))
        for d in datasets
        if d.get("name") is not None 
        and d.get("size") is not None
    ]

def sizeof_fmt(num, suffix="B"):
    for unit in ["", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi"]:
        if abs(num) < 1024.0:
            return f"{num:3.1f}{unit}{suffix}"
        num /= 1024.0
    return f"{num:.1f}Yi{suffix}"

def create_table(d: Dataset):
    table = Table()
    table.add_column("english")
    table.add_column(d.language)
    for i, line in enumerate(requests.get(d.url, stream=True).iter_lines()):
        if i > 10000:
            break
        if i % 500 == 0:
            table.add_row(*str(line, encoding="utf-8").split("\t"))
    return (d, table)

def main(
    language: str, 
    directory: str = "./data", 
    concurrency: int = 4, 
    mix: bool = False
):
    """
    Fetches datasets from the central high-resource repository at https://archive.org/download/english-portuguese-statmt
    """
    datasets = [d for d in fetch() if d.language == language and not d.source == "tatoeba_aggregated" and not d.source == "5grams"]
    console = Console()
    desired_datasets = [d for d in datasets if d.source == "topics_short_phrases"]

    with ThreadPoolExecutor(max_workers=concurrency) as ex:

        table_futs = [ex.submit(lambda: create_table(d)) for d in datasets]

        for table_pair in as_completed(table_futs):
            (dataset, table) = table_pair.result()
            rich.print(dataset)
            console.print(table)
            if not Confirm.ask("Would you like to exclude this dataset?"):
                desired_datasets.append(deepcopy(dataset))

        if not os.path.exists(directory):
            os.mkdir(directory)

        rich.print(desired_datasets)

        downloader_futs = [ex.submit(lambda data: os.system(f"curl -sLk {data.url} | head -n 2000000 > {os.path.join(directory, data.name)}"), d) for d in desired_datasets]

        for i, success in enumerate(as_completed(downloader_futs)):
            match success.result():
                case 0:
                    print(f"{str(i+1)} downloaded successfully!")
                    rich.print(os.listdir(directory))
                case 1:
                    print("Failure happened. Dunno why. I'm just a Python script.")

        if not mix:
            print("All done!")
            return

        print("Time to do some mixing! (I have no idea how long this will take, sorry)")

        cmd = f"cat {os.path.join(directory, '*')} | shuf | split -l 1000000 - {os.path.join(directory, language + '_')}"

        os.system(cmd)
        print("Okay, we're done!")

if __name__ == "__main__":
    typer.run(main)