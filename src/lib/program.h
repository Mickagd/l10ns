
#include <string>
#include <vector>
#include <boost/asio.hpp>
#include "types.h"
#include "server.cpp"

#define L10NS_VERSION "0.1.0"

#ifndef COMMAND_LINE_PARSER_H
#define COMMAND_LINE_PARSER_H

using namespace std;

class program {
public:
    program():
        signals(nullptr),
        server_(nullptr),
        output_color(true),
        verbose(true),
        diagnostics(vector<diagnostic> {}),
        language(nullptr),
        key(nullptr) { }

    /**
     * BCP47 compliant language.
     */
    string* language;

    /**
     * Localization key.
     */
    string* key;

    vector<diagnostic> diagnostics;

    /**
     * Server used as IPC communication.
     */
    server* server_;

    /**
     * Determine whether the terminal output should be colorized.
     */
    bool output_color;

    /**
     * Determine whether the process should be verbose.
     */
    bool verbose;

    /**
     * Initialize program and parse the command line arguments.
     */
    void init(int argc, char * argv[]);

    /**
     * Show help section.
     */
    void show_help() const;

    /**
     * Show version.
     */
    void show_version() const;

    /**
     * Start localization server.
     */
    void start_localization_server();

private:
    boost::asio::signal_set* signals;
    void parse_options(int argc, char **argv);
    void handle_sig_event(const boost::system::error_code& error, const char* socket_path);
};

#endif
