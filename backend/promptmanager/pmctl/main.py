import argparse
import subprocess
import psutil
import operator
import platform
import os
import socket

from pathlib import Path


def main():
    parser = argparse.ArgumentParser(prog='pmctl')

    parser.add_argument(
        "-v", "--version", action="version",
        version=f"{parser.prog} version 1.0.0"
    )

    subparsers = parser.add_subparsers(dest='sub_command', help='sub-command help')

    service_parser = subparsers.add_parser('service')
    service_parser.add_argument('action', choices=['start', 'stop'], help='action to perform on the service')
    service_parser.add_argument('-ip', type=str, help='service ip')
    service_parser.add_argument('-port', type=int, help='serivce port')
    service_parser.add_argument('-proxy', type=str, help='model proxy')
    service_parser.add_argument('-db', type=str, help='sqlite db path')

    args = parser.parse_args()

    if getattr(args, "sub_command") == 'service':
        if args.action == 'start':
            port = 9999
            if args.port:
                port = args.port
            print('service port: ' + str(port))

            ip = socket.gethostbyname(socket.gethostname())
            if args.ip:
                ip = args.ip
            print('service ip: ' + ip)

            ip_port = ip + ':' + str(port)
            runserver_url = 'http://' + ip_port
            os.putenv('RUNSERVER_URL', runserver_url)
            print('runserver_url: ' + runserver_url)

            proxy = args.proxy
            if proxy:
                os.putenv('MODEL_PROXY', proxy)
                print('proxy: ' + proxy)

            if args.db:
                db_path = args.db
                print('sqlite db path: ' + db_path)
                os.putenv('SQLITE_DB_PATH', db_path)

            manage_path = str(Path(__file__).resolve().parent.parent / 'manage.py')
            print('manege_path: ' + manage_path)
            subprocess.run(['python', f"{manage_path}", 'runserver', f"{ip_port}", '--settings=PromptManager.settings.install'])
        elif args.action == 'stop':
            pids = get_runserver_pids()
            if not pids:
                print('service PID not found!')
            else:
                for pid in pids:
                    print('PID ' + str(pid) + ' will be killed!')
                    os.kill(pid, 9)
            print('service stop done')


def get_runserver_pids():
    pids = []
    system = platform.system()
    if system == 'Windows':
        name = 'promptmanager\manage.py'
    else:
        name = 'promptmanager/manage.py'
    for process in psutil.process_iter(['pid', 'cmdline']):
        cmdline = process.info['cmdline']
        if cmdline:
            for line in cmdline:
                if operator.contains(line, name):
                    pids.append(process.pid)
    return pids


if __name__ == "__main__":
    main()
